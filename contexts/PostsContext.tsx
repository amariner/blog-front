
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Post, PostCategory, ContentBlock, generateBlockId, TextBlock, SliderBlock, ButtonBlock, ImageSlide, TitleBlock } from '../types';
import { INITIAL_POSTS, slugify } from '../data';

interface PostsContextType {
  posts: Post[];
  getPostBySlug: (slug: string) => Post | undefined;
  updatePost: (updatedPost: Post) => void;
  addPost: (newPostData: Omit<Post, 'id' | 'slug' | 'date' | 'content'> & { content?: ContentBlock[] }) => Post;
  processImportedData: (importedData: Partial<Post>[]) => void;
  isLoading: boolean;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Helper to ensure content is always ContentBlock[] and blocks are valid
const ensureContentBlocks = (content: any): ContentBlock[] => {
  if (Array.isArray(content)) {
    return content.map(block => {
      if (!block || typeof block.id !== 'string' || typeof block.type !== 'string') {
        // If basic block structure is missing, create a default text block
        return { id: generateBlockId(), type: 'text', text: JSON.stringify(block) } as TextBlock;
      }
      switch (block.type) {
        case 'text':
          return { ...block, text: typeof block.text === 'string' ? block.text : '' } as TextBlock;
        case 'title':
          return { 
            ...block, 
            text: typeof block.text === 'string' ? block.text : '',
            level: typeof block.level === 'number' && [2,3,4].includes(block.level) ? block.level : 2 
          } as TitleBlock;
        case 'slider':
          const slides = Array.isArray(block.slides) ? block.slides.map((slide: any) => ({
            id: typeof slide.id === 'string' ? slide.id : generateBlockId(),
            imageUrl: typeof slide.imageUrl === 'string' ? slide.imageUrl : '',
            linkUrl: typeof slide.linkUrl === 'string' ? slide.linkUrl : undefined,
          })) : [];
          return { ...block, type: 'slider', slides } as SliderBlock;
        case 'button':
          return {
            ...block,
            type: 'button',
            text: typeof block.text === 'string' ? block.text : '',
            linkUrl: typeof block.linkUrl === 'string' ? block.linkUrl : '#',
          } as ButtonBlock;
        default:
          // Unknown block type, convert to text block with stringified content
          return { id: block.id, type: 'text', text: JSON.stringify(block) } as TextBlock;
      }
    }).filter(Boolean) as ContentBlock[]; // Filter out any nulls from potential future logic
  }
  if (typeof content === 'string') {
    return content.split('\n').filter(line => line.trim() !== '').map(line => ({
      id: generateBlockId(),
      type: 'text',
      text: line,
    } as TextBlock));
  }
  return []; // Default to empty array if cannot be converted
};


export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedPosts = localStorage.getItem('blogPosts');
    if (storedPosts) {
      try {
        const parsedPosts = JSON.parse(storedPosts) as Post[];
        // Ensure all posts have content as ContentBlock[]
        const validatedPosts = parsedPosts.map(post => ({
          ...post,
          content: ensureContentBlocks(post.content),
        }));
        setPosts(validatedPosts);
      } catch (error) {
        console.error("Error parsing posts from localStorage:", error);
        setPosts(INITIAL_POSTS.map(post => ({...post, content: ensureContentBlocks(post.content)}))); // Fallback
      }
    } else {
      setPosts(INITIAL_POSTS.map(post => ({...post, content: ensureContentBlocks(post.content)})));
      localStorage.setItem('blogPosts', JSON.stringify(INITIAL_POSTS));
    }
    setIsLoading(false);
  }, []);

  const updateLocalStorage = (updatedPosts: Post[]) => {
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
  };

  const getPostBySlug = useCallback((slug: string): Post | undefined => {
    return posts.find(p => p.slug === slug);
  }, [posts]);

  const updatePost = (updatedPostData: Post) => {
    setPosts(prevPosts => {
      const newPosts = prevPosts.map(p => 
        p.id === updatedPostData.id ? 
        { ...updatedPostData, content: ensureContentBlocks(updatedPostData.content) } 
        : p
      );
      updateLocalStorage(newPosts);
      return newPosts;
    });
  };
  
  const addPost = (newPostData: Omit<Post, 'id' | 'slug' | 'date' | 'content'> & { content?: ContentBlock[] }): Post => {
    const newPost: Post = {
      ...newPostData,
      id: String(Date.now() + Math.random()), 
      slug: slugify(newPostData.title) || `post-${Date.now()}`,
      date: new Date().toISOString(),
      content: newPostData.content ? ensureContentBlocks(newPostData.content) : [{id: generateBlockId(), type: 'text', text: ''}], // Default with one empty text block
    };
    setPosts(prevPosts => {
      const newPosts = [...prevPosts, newPost];
      updateLocalStorage(newPosts);
      return newPosts;
    });
    return newPost;
  };

  const processImportedData = (importedData: Partial<Post>[]) => {
    setPosts(prevPosts => {
      let currentPosts = [...prevPosts];
      const processedIds = new Set<string>();

      importedData.forEach(item => {
        const itemContentBlocks = ensureContentBlocks(item.content);

        if (item.id && currentPosts.find(p => p.id === item.id)) {
          currentPosts = currentPosts.map(p => {
            if (p.id === item.id) {
              processedIds.add(p.id);
              return {
                ...p,
                title: item.title ?? p.title,
                slug: item.title ? (slugify(item.title) || p.slug) : p.slug,
                content: itemContentBlocks.length > 0 ? itemContentBlocks : p.content,
                author: item.author ?? p.author,
                date: item.date ?? p.date,
                category: Object.values(PostCategory).includes(item.category as PostCategory) ? item.category as PostCategory : p.category,
                imageUrl: item.imageUrl ?? p.imageUrl,
              };
            }
            return p;
          });
        } else { 
          if (item.title && item.author && item.category && item.imageUrl) {
             const newPost: Post = {
                id: item.id || String(Date.now() + Math.random()),
                title: item.title,
                slug: slugify(item.title) || `post-${Date.now()}`,
                content: itemContentBlocks.length > 0 ? itemContentBlocks : [{id: generateBlockId(), type: 'text', text:''}],
                author: item.author,
                date: item.date || new Date().toISOString(),
                category: Object.values(PostCategory).includes(item.category as PostCategory) ? item.category as PostCategory : PostCategory.GENERAL,
                imageUrl: item.imageUrl,
            };
            if (!currentPosts.find(p => p.id === newPost.id)) {
                 currentPosts.push(newPost);
                 processedIds.add(newPost.id);
            }
          }
        }
      });
      updateLocalStorage(currentPosts);
      return currentPosts;
    });
  };

  return (
    <PostsContext.Provider value={{ posts, getPostBySlug, updatePost, addPost, processImportedData, isLoading }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = (): PostsContextType => {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};
