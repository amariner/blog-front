import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Post, PostCategory, ContentBlock, generateBlockId, TextBlock } from '../types';
import { supabase, getPosts, getPostBySlug as getPostBySlugFromDb, createPost as createPostInDb, updatePost as updatePostInDb, importPosts } from '../src/lib/supabase';
import { ensureContentBlocks } from '../src/utils/contentHelpers';

interface PostsContextType {
  posts: Post[];
  getPostBySlug: (slug: string) => Promise<Post | undefined>;
  updatePost: (updatedPost: Post) => Promise<void>;
  addPost: (newPostData: Omit<Post, 'id' | 'slug' | 'date' | 'content'> & { content?: ContentBlock[] }) => Promise<Post>;
  processImportedData: (importedData: Partial<Post>[]) => Promise<void>;
  isLoading: boolean;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts.map(post => ({
        ...post,
        content: ensureContentBlocks(post.content)
      })));
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPostBySlug = useCallback(async (slug: string): Promise<Post | undefined> => {
    try {
      const post = await getPostBySlugFromDb(slug);
      return post ? { ...post, content: ensureContentBlocks(post.content) } : undefined;
    } catch (error) {
      console.error('Error getting post by slug:', error);
      return undefined;
    }
  }, []);

  const updatePost = async (updatedPost: Post) => {
    try {
      const updated = await updatePostInDb({
        ...updatedPost,
        content: ensureContentBlocks(updatedPost.content)
      });
      setPosts(prevPosts => 
        prevPosts.map(p => p.id === updated.id ? updated : p)
      );
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const addPost = async (newPostData: Omit<Post, 'id' | 'slug' | 'date' | 'content'> & { content?: ContentBlock[] }): Promise<Post> => {
    const newPost = {
      ...newPostData,
      slug: slugify(newPostData.title),
      date: new Date().toISOString(),
      content: newPostData.content ? ensureContentBlocks(newPostData.content) : [{ id: generateBlockId(), type: 'text', text: '' } as TextBlock]
    };

    try {
      const created = await createPostInDb(newPost);
      setPosts(prevPosts => [...prevPosts, created]);
      return created;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  const processImportedData = async (importedData: Partial<Post>[]) => {
    try {
      await importPosts(importedData);
      await loadPosts(); // Reload posts after import
    } catch (error) {
      console.error('Error processing imported data:', error);
      throw error;
    }
  };

  return (
    <PostsContext.Provider value={{ 
      posts, 
      getPostBySlug, 
      updatePost, 
      addPost, 
      processImportedData, 
      isLoading 
    }}>
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