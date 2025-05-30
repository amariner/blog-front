import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getPostBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data;
};

export const createPost = async (post: any) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updatePost = async (post: any) => {
  const { data, error } = await supabase
    .from('posts')
    .update(post)
    .eq('id', post.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const importPosts = async (posts: any[]) => {
  const { data, error } = await supabase
    .from('posts')
    .upsert(posts)
    .select();
  
  if (error) throw error;
  return data;
};