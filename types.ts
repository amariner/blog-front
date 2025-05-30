
export enum PostCategory {
  FASHION = "Fashion",
  TECHNOLOGY = "Technology",
  TRAVEL = "Travel",
  FOOD = "Food",
  GENERAL = "General",
}

// Block Types for Structured Content
export type ContentBlockType = 'text' | 'title' | 'slider' | 'button';

export interface BaseBlock {
  id: string; // Unique ID for the block within a post
  type: ContentBlockType;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  text: string;
}

export interface TitleBlock extends BaseBlock {
  type: 'title';
  text: string;
  level: 2 | 3 | 4; // e.g., H2, H3, H4
}

export interface ImageSlide {
  id: string;
  imageUrl: string;
  linkUrl?: string;
}

export interface SliderBlock extends BaseBlock {
  type: 'slider';
  slides: ImageSlide[];
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  text: string;
  linkUrl: string;
}


// Union of all possible content blocks
export type ContentBlock = TextBlock | TitleBlock | SliderBlock | ButtonBlock;

export interface Post {
  id:string;
  slug: string;
  title: string;
  content: ContentBlock[]; // Changed from string to ContentBlock[]
  author: string;
  date: string; // ISO date string e.g. "2023-10-26T10:00:00Z"
  category: PostCategory;
  imageUrl: string; // Hero image for the post
}

// Utility to generate unique IDs for blocks
export const generateBlockId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};