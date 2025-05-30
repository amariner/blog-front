import { ContentBlock, TextBlock, TitleBlock, SliderBlock, ButtonBlock, generateBlockId } from '../../types';

export const ensureContentBlocks = (content: any): ContentBlock[] => {
  if (Array.isArray(content)) {
    return content.map(block => {
      if (!block || typeof block.id !== 'string' || typeof block.type !== 'string') {
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
          return { id: block.id, type: 'text', text: JSON.stringify(block) } as TextBlock;
      }
    }).filter(Boolean) as ContentBlock[];
  }
  if (typeof content === 'string') {
    return content.split('\n').filter(line => line.trim() !== '').map(line => ({
      id: generateBlockId(),
      type: 'text',
      text: line,
    } as TextBlock));
  }
  return [];
};