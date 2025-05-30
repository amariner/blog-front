
import { Post, PostCategory, ContentBlock, TextBlock, TitleBlock, SliderBlock, ButtonBlock, ImageSlide, generateBlockId } from './types';

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper to convert old string content to ContentBlock[]
const stringToContentBlocks = (text: string): ContentBlock[] => {
  if (!text || typeof text !== 'string') return [];
  return text.split('\n').filter(line => line.trim() !== '').map(line => ({
    id: generateBlockId(),
    type: 'text',
    text: line,
  } as TextBlock));
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'new_post_1',
    slug: slugify("Urban Style: The New Fashion Frontier"),
    title: "Urban Style: The New Fashion Frontier",
    author: "Chic Coco",
    date: '2024-08-01T10:00:00Z', // Latest post
    category: PostCategory.FASHION,
    imageUrl: 'https://picsum.photos/seed/fashionhero_new1/1200/800',
    content: [
      { id: generateBlockId(), type: 'title', text: 'Minimalism Reimagined', level: 2 },
      { id: generateBlockId(), type: 'text', text: "Modern urban style is increasingly leaning towards a sophisticated form of minimalism. It's about clean lines, quality fabrics, and versatile pieces that can transition effortlessly from day to night. Think less about fleeting trends and more about timeless design with a contemporary edge." },
      { id: generateBlockId(), type: 'text', text: "The color palette often revolves around neutrals – blacks, whites, grays, and beiges – but punctuated with strategic pops of color or bold textures to add personality. The focus is on the silhouette and the subtle details that elevate a simple outfit into a statement." },
      { id:generateBlockId(), type: 'title', text: 'Accessorizing the Look', level: 3 },
      { id: generateBlockId(), type: 'text', text: "Accessories play a crucial role in this new urban aesthetic. Chunky sneakers, minimalist jewelry, and structured bags are key components. It's about choosing pieces that are both functional and stylish, reflecting a practical yet fashion-forward mindset." }
    ]
  },
  {
    id: 'new_post_2',
    slug: slugify("A Visual Journey: Captivating Landscapes"),
    title: "A Visual Journey: Captivating Landscapes",
    author: "Explorer Elias",
    date: '2024-07-28T14:30:00Z',
    category: PostCategory.TRAVEL,
    imageUrl: 'https://picsum.photos/seed/travelhero_new1/1200/800',
    content: [
      { id: generateBlockId(), type: 'text', text: "Travel photography allows us to capture and share the breathtaking beauty of our planet. From soaring peaks to tranquil shores, each landscape tells a unique story. Join us as we explore some stunning vistas through the lens." },
      { id: generateBlockId(), type: 'title', text: 'Mountain Majesties', level: 2 },
      { id: generateBlockId(), type: 'text', text: "The raw power and grandeur of mountain ranges have always captivated the human spirit. Their rugged beauty offers a sense of perspective and awe." },
      {
        id: generateBlockId(),
        type: 'slider',
        slides: [
          { id: generateBlockId(), imageUrl: 'https://picsum.photos/seed/landscapes_A1/1000/700', linkUrl: '#' },
          { id: generateBlockId(), imageUrl: 'https://picsum.photos/seed/landscapes_B1/1000/700' },
          { id: generateBlockId(), imageUrl: 'https://picsum.photos/seed/landscapes_C1/1000/700', linkUrl: '#' }
        ]
      },
      { id: generateBlockId(), type: 'text', text: "Whether it's the sharp, snow-capped peaks or the serene alpine meadows, mountains provide endless photographic opportunities, challenging us to capture their scale and detail." },
      { id: generateBlockId(), type: 'title', text: 'Coastal Charms', level: 2 },
      { id: generateBlockId(), type: 'text', text: "Coastlines offer a dynamic interplay of land and sea, from dramatic cliffs to serene beaches. The ever-changing light and tides create a constantly evolving canvas for photographers." },
      {
        id: generateBlockId(),
        type: 'slider',
        slides: [
          { id: generateBlockId(), imageUrl: 'https://picsum.photos/seed/coastal_A1/1000/700' },
          { id: generateBlockId(), imageUrl: 'https://picsum.photos/seed/coastal_B1/1000/700', linkUrl: '#' }
        ]
      },
      { id: generateBlockId(), type: 'text', text: "The rhythmic sound of waves, the salty air, and the vibrant ecosystems make coastal regions a favorite subject for those looking to capture nature's artistry." }
    ]
  },
  {
    id: 'new_post_3',
    slug: slugify("Interactive Tech: Gadgets Redefined"),
    title: "Interactive Tech: Gadgets Redefined",
    author: "Techie Tina",
    date: '2024-07-25T09:15:00Z',
    category: PostCategory.TECHNOLOGY,
    imageUrl: 'https://picsum.photos/seed/techhero_new1/1200/800',
    content: [
      { id: generateBlockId(), type: 'text', text: "The world of technology is constantly evolving, with new gadgets emerging that redefine how we interact with the digital and physical worlds. These innovations promise greater convenience, connectivity, and entertainment." },
      { id: generateBlockId(), type: 'title', text: 'The Latest Smartwatch Evolution', level: 2 },
      { id: generateBlockId(), type: 'text', text: "Smartwatches are no longer just extensions of our phones. The newest models boast advanced health tracking, independent connectivity, and sophisticated apps that make them indispensable tools for daily life. Battery life and user interface design continue to see major improvements." },
      { 
        id: generateBlockId(), 
        type: 'button', 
        text: 'Discover Top Smartwatches on TechRadar', 
        linkUrl: 'https://www.techradar.com/news/wearables/best-smart-watches-what-s-the-best-wearable-tech-for-you-1154074' 
      },
      { id: generateBlockId(), type: 'title', text: 'The Future of Augmented Reality', level: 3 },
      { id: generateBlockId(), type: 'text', text: "Augmented reality (AR) is moving beyond gaming and entertainment into practical applications in education, retail, and industry. Imagine interactive museum exhibits, virtual furniture placement in your home, or enhanced training simulations for complex tasks. The possibilities are expanding rapidly." }
    ]
  },
  {
    id: 'new_post_4',
    slug: slugify("Street Food Stories: A Global Bite"),
    title: "Street Food Stories: A Global Bite",
    author: "Chef Remy",
    date: '2024-07-20T11:00:00Z',
    category: PostCategory.FOOD,
    imageUrl: 'https://picsum.photos/seed/foodhero_new1/1200/800',
    content: [
      { id: generateBlockId(), type: 'text', text: "Street food offers an authentic and vibrant taste of a region's culture and culinary heritage. It's food for the people, often prepared with generations of knowledge and a passion for local ingredients." },
      { id: generateBlockId(), type: 'title', text: 'Night Market Wonders', level: 2 },
      { id: generateBlockId(), type: 'text', text: "The bustling night markets of Asia are legendary, offering a dizzying array of sights, sounds, and smells. From savory skewers and steaming bowls of noodles to sweet, exotic treats, these markets are a feast for the senses." },
      { id: generateBlockId(), type: 'title', text: 'The Art of Simple Eats', level: 2 },
      { id: generateBlockId(), type: 'text', text: "Often, the most memorable street food dishes are deceptively simple. Perfected over time, they rely on the quality of fresh ingredients and the skill of the vendor to create flavors that are both comforting and exciting. Exploring street food is a delicious adventure." }
    ]
  },
  {
    id: 'new_post_5',
    slug: slugify("Home Sanctuaries: Creating Your Peaceful Space"),
    title: "Home Sanctuaries: Creating Your Peaceful Space",
    author: "Zen Zoe",
    date: '2024-07-15T16:45:00Z',
    category: PostCategory.GENERAL,
    imageUrl: 'https://picsum.photos/seed/homehero_new1/1200/800',
    content: [
      { id: generateBlockId(), type: 'text', text: "In our fast-paced lives, our homes should be more than just a place to live; they should be sanctuaries where we can relax, recharge, and find peace. Creating such an environment involves thoughtful design and mindful choices." },
      { id: generateBlockId(), type: 'title', text: 'Color Psychology in Your Home', level: 2 },
      { id: generateBlockId(), type: 'text', text: "Colors have a profound impact on our mood and emotions. Soft blues and greens can evoke calmness, while warm yellows and oranges can create a cozy, inviting atmosphere. Understanding color psychology can help you design spaces that support your well-being." },
      { id: generateBlockId(), type: 'title', text: 'Decluttering for Clarity', level: 3 },
      { id: generateBlockId(), type: 'text', text: "A cluttered space often leads to a cluttered mind. Regularly decluttering and organizing your home can significantly reduce stress and improve focus. Embrace minimalism by keeping only what you truly need and love, creating a more open and breathable environment." }
    ]
  }
];

// CSV Utilities

export const escapeCSVField = (field: any): string => {
  const stringField = String(field === null || typeof field === 'undefined' ? '' : field);
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export const convertPostsToCSV = (posts: Post[]): string => {
  const headers = ['id', 'slug', 'title', 'content', 'author', 'date', 'category', 'imageUrl'];
  const headerString = headers.join(',');

  const rows = posts.map(post => 
    headers.map(header => {
      if (header === 'content') {
        return escapeCSVField(JSON.stringify(post.content));
      }
      const postKey = header as keyof Omit<Post, 'content'>;
      if (header in post && header !== 'content') {
         return escapeCSVField(post[postKey]);
      }
      return ''; 
    }).join(',')
  );

  return [headerString, ...rows].join('\n');
};

const parseCSVRow = (rowString: string): string[] => {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < rowString.length; i++) {
        const char = rowString[i];
        if (char === '"') {
            if (inQuotes && i + 1 < rowString.length && rowString[i + 1] === '"') {
                // Escaped double quote
                currentField += '"';
                i++; // Skip next quote
            } else {
                // Start or end of quoted field
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            fields.push(currentField);
            currentField = '';
        } else {
            currentField += char;
        }
    }
    fields.push(currentField); // Add the last field
    return fields;
};

export const parseCSVToPosts = (csvText: string): Partial<Post>[] => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    console.warn("CSV is empty or has no data rows.");
    return [];
  }

  const headerLine = lines[0];
  const headers = parseCSVRow(headerLine).map(h => h.trim()); // Use robust parser for headers too
  
  const expectedHeaders: (keyof Post | string)[] = ['id', 'slug', 'title', 'content', 'author', 'date', 'category', 'imageUrl'];
  const missingHeaders = expectedHeaders.filter(eh => !headers.includes(eh as string));
  if(missingHeaders.length > 0) {
      console.warn("CSV is missing expected headers:", missingHeaders.join(', '), ". Parsing might be incomplete or incorrect. Actual headers found:", headers);
  }

  const postData: Partial<Post>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = parseCSVRow(line);
    if (values.length !== headers.length) {
        console.warn(`Row ${i+1} has an incorrect number of fields. Expected ${headers.length}, got ${values.length}. Skipping row: "${line}"`);
        continue;
    }
    
    const postObject: Partial<Post> = {};
    
    headers.forEach((header, index) => {
      const key = header as keyof Post;
      let value: string | undefined = values[index]; // Value is already unquoted by parseCSVRow if it was quoted
      
      if (key === 'content') {
        if (value) {
          try {
            const parsedContent = JSON.parse(value); // Value should be the raw JSON string
            if (Array.isArray(parsedContent)) {
              postObject[key] = parsedContent;
            } else {
              console.warn(`Parsed content for row ${i+1} is not an array, converting to TextBlock(s). Original value:`, value);
              postObject[key] = stringToContentBlocks(value); 
            }
          } catch (e) {
            console.warn(`Failed to parse 'content' as JSON for row ${i+1}. Error: ${e}. Original value: "${value}". Treating as plain text.`);
            postObject[key] = stringToContentBlocks(value);
          }
        } else {
          postObject[key] = []; // Default to empty array if content is missing
        }
      } else if (key === 'category') {
        if (value && Object.values(PostCategory).includes(value as PostCategory)) {
          postObject[key] = value as PostCategory;
        } else if (value) {
          console.warn(`Invalid category "${value}" in CSV row ${i+1}. Defaulting to General.`);
          postObject[key] = PostCategory.GENERAL;
        } else {
          postObject[key] = PostCategory.GENERAL;
        }
      } else if (value !== undefined) {
        // Ensure 'id' and 'slug' are always strings, even if CSV has them as numbers without quotes
        if ((key === 'id' || key === 'slug') && typeof value === 'number') {
            (postObject as any)[key] = String(value);
        } else {
            (postObject as any)[key] = value;
        }
      }
    });
    postData.push(postObject);
  }
  return postData;
};
