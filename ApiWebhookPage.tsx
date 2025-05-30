
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePosts } from './contexts/PostsContext';
import { Post, PostCategory, ContentBlock, TextBlock, TitleBlock, SliderBlock, ButtonBlock, ImageSlide, ContentBlockType, generateBlockId } from './types';
import { slugify } from './data';

// --- IMPORTANT ---
// THIS IS A DEMONSTRATION KEY FOR THE SIMULATED WEBHOOK.
// IN A REAL-WORLD SCENARIO WITH A BACKEND, THIS KEY AND THE ENTIRE
// WEBHOOK LOGIC WOULD BE HANDLED SECURELY ON THE SERVER.
// Replace this with a strong, unique key if you use this simulation for any purpose.
const DEMO_WEBHOOK_API_KEY = 'YOUR_MAKE_COM_SECRET_KEY_12345'; // TODO: Replace with your actual secret key

const ApiWebhookPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addPost, updatePost, posts, getPostBySlug } = usePosts();

  useEffect(() => {
    const processWebhook = async () => {
      console.log('Webhook endpoint hit. Processing request...');
      const queryParams = new URLSearchParams(location.search);
      const apiKey = queryParams.get('apiKey');

      // 1. Authenticate (Simulated)
      if (apiKey !== DEMO_WEBHOOK_API_KEY) {
        console.error('Webhook Error: Invalid API Key provided.');
        // In a real API, you'd return a 401/403 HTTP status.
        // For this frontend simulation, we log the error. Make.com might interpret
        // the lack of expected changes or logs as a failure.
        return; // Stop processing
      }

      // 2. Get Action and Parameters from query string
      const action = queryParams.get('action'); // Expected: 'create' or 'update'
      const postId = queryParams.get('id'); // Required for 'update', can be ID or slug
      const title = queryParams.get('title');
      const author = queryParams.get('author');
      const categoryParam = queryParams.get('category');
      const imageUrl = queryParams.get('imageUrl');
      const contentJson = queryParams.get('content'); // Expecting a URL-encoded JSON string of ContentBlock[]

      let webhookResponse = { status: 'error', message: 'An unknown error occurred.', data: {} };

      try {
        let parsedContent: ContentBlock[] = [];
        if (contentJson) {
          try {
            const rawContent = JSON.parse(decodeURIComponent(contentJson));
            if (!Array.isArray(rawContent)) {
              throw new Error("Parsed 'content' is not an array.");
            }
            // Map and validate to ensure correct ContentBlock types
            parsedContent = rawContent.map((rawBlock: any): ContentBlock | null => {
              const id = rawBlock.id || generateBlockId();
              // Use rawBlock.type directly for the switch, ensure it's treated as a potential ContentBlockType
              const type = rawBlock.type as ContentBlockType | string; 

              switch (type) {
                case 'text':
                  return { id, type: 'text', text: String(rawBlock.text ?? '') } as TextBlock;
                case 'title':
                  const level = Number(rawBlock.level);
                  return {
                    id,
                    type: 'title',
                    text: String(rawBlock.text ?? ''),
                    level: [2, 3, 4].includes(level) ? (level as 2 | 3 | 4) : 2,
                  } as TitleBlock;
                case 'slider':
                  const slides: ImageSlide[] = Array.isArray(rawBlock.slides)
                    ? rawBlock.slides.map((slide: any) => ({
                        id: slide.id || generateBlockId(),
                        imageUrl: String(slide.imageUrl ?? ''),
                        linkUrl: slide.linkUrl ? String(slide.linkUrl) : undefined,
                      }))
                    : [];
                  return { id, type: 'slider', slides } as SliderBlock;
                case 'button':
                  return {
                    id,
                    type: 'button',
                    text: String(rawBlock.text ?? ''),
                    linkUrl: String(rawBlock.linkUrl ?? '#'),
                  } as ButtonBlock;
                default:
                  console.warn(`Webhook: Unknown or malformed block type '${type}'. Original block:`, rawBlock);
                  // Convert unknown blocks to a default text block
                  return { id, type: 'text', text: `Unsupported block: ${JSON.stringify(rawBlock)}` } as TextBlock;
              }
            }).filter((block): block is ContentBlock => block !== null); // Type guard to filter out nulls and ensure type

          } catch (e: any) {
            webhookResponse = { status: 'error', message: `Invalid 'content' JSON: ${e.message}`, data: { receivedContent: contentJson } };
            console.error('Webhook Error:', webhookResponse.message, webhookResponse.data);
            return; // Stop processing
          }
        }

        const category = categoryParam && Object.values(PostCategory).includes(categoryParam as PostCategory)
          ? categoryParam as PostCategory
          : PostCategory.GENERAL;

        if (action === 'create') {
          if (!title || !author || !categoryParam || !imageUrl) {
            webhookResponse = { status: 'error', message: 'Missing required fields for create action: title, author, category, imageUrl.', data: {} };
          } else {
            const newPostData = {
              title,
              author,
              category,
              imageUrl,
              content: parsedContent.length > 0 
                ? parsedContent 
                : [{ id: generateBlockId(), type: 'text', text: 'Default content from webhook.' } as TextBlock],
            };
            const createdPost = addPost(newPostData); // addPost should return the created Post object
            webhookResponse = { status: 'success', message: 'Post created successfully via webhook.', data: { postId: createdPost.id, slug: createdPost.slug } };
          }
        } else if (action === 'update') {
          if (!postId) {
            webhookResponse = { status: 'error', message: "Missing 'id' or 'slug' for update action.", data: {} };
          } else {
            // Try to find post by ID first, then by slug if not found by ID.
            let existingPost = posts.find(p => p.id === postId) || getPostBySlug(postId);
            
            if (!existingPost) {
              webhookResponse = { status: 'error', message: `Post with ID/Slug '${postId}' not found for update.`, data: { postIdQuery: postId } };
            } else {
              const updatedPostData: Post = {
                ...existingPost,
                title: title ?? existingPost.title,
                author: author ?? existingPost.author,
                category: (categoryParam ? category : existingPost.category),
                imageUrl: imageUrl ?? existingPost.imageUrl,
                content: parsedContent.length > 0 ? parsedContent : existingPost.content,
                slug: title ? slugify(title) : existingPost.slug, // Re-slugify if title changes
                date: existingPost.date, // Keep original date, or could accept a date param for update
              };
              updatePost(updatedPostData);
              webhookResponse = { status: 'success', message: 'Post updated successfully via webhook.', data: { postId: updatedPostData.id, slug: updatedPostData.slug } };
            }
          }
        } else {
          webhookResponse = { status: 'error', message: "Invalid or missing 'action' parameter. Must be 'create' or 'update'.", data: {} };
        }
      } catch (e: any) {
        webhookResponse = { status: 'error', message: `Webhook processing error: ${e.message}`, data: { stack: e.stack } };
      }

      console.log('Webhook Response:', webhookResponse);

      // This component is not meant to render UI.
      // For Make.com, it will see the page load (HTTP 200 for the route hitting this component).
      // The success/failure details are in the console log or by observing data changes.
      // Optionally, navigate away to provide a cleaner state, though not necessary for Make.com.
      // navigate('/');
    };

    processWebhook();

  }, [location, navigate, addPost, updatePost, posts, getPostBySlug]);

  // This component does not render any actual UI.
  // It acts as a handler for the /api/posts/webhook route.
  return null;
};

export default ApiWebhookPage;
