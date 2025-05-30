
import React, { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { Link, Navigate, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { usePosts } from './contexts/PostsContext';
import { Post, PostCategory, ContentBlock, TextBlock, TitleBlock, SliderBlock, ButtonBlock, ImageSlide, ContentBlockType, generateBlockId } from './types';
import { formatDate, slugify as slugifyAsUtil } from './data';

// --- ICONS ---
const SearchIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const EnvelopeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string, strokeWidth?: number }> = ({ className = "w-6 h-6", strokeWidth = 1.5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={strokeWidth} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const HamburgerIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.095 1.026.94 1.874 2.006 1.874h6.548c1.067 0 1.912-.848 2.006-1.873M18.75 10.75H5.25" />
  </svg>
);

const ArrowUpIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
  </svg>
);

const ArrowDownIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
  </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);


// --- NAVBAR & FOOTER (UNCHANGED, KEEPING FOR BREVITY IN THIS EXAMPLE) ---
export const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: "THE WARDROBE", to: "/category/Fashion" }, 
    { label: "THE LIFESTYLE", to: "/category/Travel" },
    { label: "THE HOME", to: "/category/General" },
    { label: "THE GARAGE", to: "/category/Technology" },
    { label: "WIN", to: "/" }, 
  ];

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (menuOpen) setMenuOpen(false); 
  };
  
  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
    if (searchOpen) setSearchOpen(false); 
  }

  const closeAllModals = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  }

  return (
    <nav className="bg-white text-neutral-900 sticky top-0 z-50">
      {/* Desktop Top Bar: Search, Logo, Subscribe */}
      <div className="hidden md:flex container mx-auto px-4 sm:px-6 lg:px-8 h-20 items-center">
        <div className="flex-1 flex items-center">
          <button onClick={handleSearchToggle} className="flex items-center space-x-2 hover:text-neutral-600 transition-colors group" aria-label="Open search bar">
            <SearchIcon className="w-4 h-4 group-hover:text-neutral-600" />
            <span className="text-xs uppercase tracking-wider font-medium">Search</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <Link to="/" onClick={closeAllModals} className="text-5xl font-bold font-sans tracking-[0.3em] hover:text-neutral-700 transition-colors">
            OPUMO
          </Link>
        </div>
        <div className="flex-1 flex justify-end items-center">
          <Link to="#" className="flex items-center space-x-2 hover:text-neutral-600 transition-colors group" aria-label="Subscribe">
            <EnvelopeIcon className="w-4 h-4 group-hover:text-neutral-600" />
            <span className="text-xs uppercase tracking-wider font-medium">Subscribe</span>
          </Link>
        </div>
      </div>
      <div className="hidden md:block border-b border-neutral-300"></div>

      {/* Mobile Top Bar: Menu, Logo, Search Icon */}
      <div className="md:hidden flex container mx-auto px-4 sm:px-6 lg:px-8 h-16 items-center justify-between">
        <button 
          onClick={handleMenuToggle} 
          className="text-neutral-700 hover:text-neutral-900 p-2 -ml-2"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
        <Link to="/" onClick={closeAllModals} className="text-3xl font-bold font-sans tracking-[0.2em] hover:text-neutral-700 transition-colors">
          OPUMO
        </Link>
        <button 
            onClick={handleSearchToggle} 
            className="text-neutral-700 hover:text-neutral-900 p-2 -mr-2"
            aria-label={searchOpen ? "Close search bar" : "Open search bar"}
        >
          {searchOpen ? <CloseIcon /> : <SearchIcon />}
        </button>
      </div>

      {/* Search Input Area (Mobile and Desktop) */}
      {searchOpen && (
        <div className="border-b border-neutral-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-4">
                <div className="flex items-center justify-between mb-2 md:hidden">
                    <span className="text-sm font-medium uppercase tracking-wider text-neutral-700">Search</span>
                    <button onClick={() => setSearchOpen(false)} className="text-neutral-600 hover:text-neutral-900" aria-label="Close search bar">
                        <CloseIcon className="w-5 h-5"/> <span className="text-xs uppercase">Close</span>
                    </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); alert('Search submitted (not implemented)'); }} className="flex items-center">
                    <input 
                        type="search" 
                        placeholder="Search for products, brands and articles" 
                        className="w-full px-4 py-3 border border-neutral-300 rounded-l-md focus:ring-neutral-500 focus:border-neutral-500 text-sm placeholder-neutral-500"
                        aria-label="Search input"
                    />
                    <button type="submit" className="bg-neutral-800 text-white px-6 py-3 rounded-r-md hover:bg-neutral-700 transition-colors text-sm font-medium" aria-label="Submit search">
                        Search
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Desktop Navigation Links + Shop Button (Hidden if search is open) */}
      {!searchOpen && (
        <div className="hidden md:flex container mx-auto px-4 sm:px-6 lg:px-8 h-14 items-center justify-center">
          <div className="flex space-x-10 items-center">
            {navLinks.map(link => (
              <InternalNavLink key={link.label} to={link.to} onClick={closeAllModals}>
                {link.label}
              </InternalNavLink>
            ))}
            <Link
              to="#" // Replace with actual shop link
              onClick={closeAllModals}
              className="bg-neutral-900 text-white text-xs uppercase font-semibold tracking-wider px-6 py-2.5 hover:bg-neutral-700 transition-colors rounded-sm"
              aria-label="Go to shop"
            >
              Shop
            </Link>
          </div>
        </div>
      )}
      
      {/* Main bottom border for Navbar */}
       <div className={`border-b border-neutral-300 ${searchOpen && 'md:hidden'}`}></div>


      {/* Mobile Flyout Menu (Hidden if search is open) */}
      {menuOpen && !searchOpen && (
        <div className="md:hidden bg-white border-t border-neutral-300 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map(link => (
              <InternalNavLink key={link.label} to={link.to} mobile onClick={() => setMenuOpen(false)}>
                {link.label}
              </InternalNavLink>
            ))}
            <Link
              to="#" 
              onClick={() => setMenuOpen(false)}
              className="block w-full text-left px-3 py-3 rounded-md text-sm font-medium bg-neutral-800 text-white hover:bg-neutral-700 transition-colors text-center uppercase tracking-wider my-2"
              aria-label="Go to shop"
            >
              Shop
            </Link>
            <div className="pt-2 border-t border-neutral-200">
                {isAuthenticated ? (
                <>
                    <InternalNavLink to="/admin" mobile onClick={() => setMenuOpen(false)}>Admin</InternalNavLink>
                    <button
                    onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-neutral-100 hover:text-red-700 transition-colors"
                    >
                    Logout
                    </button>
                </>
                ) : (
                <InternalNavLink to="/login" mobile onClick={() => setMenuOpen(false)}>Login</InternalNavLink>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

interface InternalNavLinkProps {
  to: string;
  children: React.ReactNode;
  mobile?: boolean;
  onClick?: () => void;
  className?: string;
}

const InternalNavLink: React.FC<InternalNavLinkProps> = ({ to, children, mobile, onClick, className }) => (
  <Link
    to={to}
    onClick={onClick}
    className={
      mobile 
      ? `block px-3 py-2.5 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors ${className}` 
      : `text-xs uppercase tracking-wider font-medium text-neutral-700 hover:text-neutral-900 transition-colors ${className}`
    }
  >
    {children}
  </Link>
);

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <Link to={href} className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline underline-offset-2 transition-colors">
    {children}
  </Link>
);

export const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'Information',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Contact Us', href: '#' },
        { label: 'FAQs', href: '#' },
        { label: 'Delivery & Returns', href: '#' },
      ],
    },
    {
      title: 'Shop',
      links: [
        { label: 'Clothing', href: '#' },
        { label: 'Footwear', href: '#' },
        { label: 'Accessories', href: '#' },
        { label: 'Furniture', href: '#' },
      ],
    },
    {
      title: 'Explore',
      links: [
        { label: 'Brands', href: '#' },
        { label: 'The Journal', href: '/' },
        { label: 'Sitemap', href: '#' },
        { label: 'Lighting', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-neutral-100 text-neutral-700 pt-16 pb-8 mt-16 border-t border-neutral-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}><FooterLink href={link.href}>{link.label}</FooterLink></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
             <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider mb-4">Connect</h3>
             <p className="text-sm text-neutral-600 mb-2">Stay up to date with the latest arrivals, offers and style highlights.</p>
             <Link to="#" className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline underline-offset-2 transition-colors">Instagram</Link> | <Link to="#" className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline underline-offset-2 transition-colors">Pinterest</Link>
          </div>
        </div>
        <div className="border-t border-neutral-300 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} OPUMO. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Powered by <span className="font-semibold">WordSeed</span> | UK</p>
        </div>
      </div>
    </footer>
  );
};

// --- POST DISPLAY COMPONENTS ---
interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const firstTextOrTitleBlock = post.content.find(block => block.type === 'text' || block.type === 'title');
  let excerpt = 'Read more...';
  if (firstTextOrTitleBlock) {
    if (firstTextOrTitleBlock.type === 'text') {
      excerpt = firstTextOrTitleBlock.text.substring(0, 150) + (firstTextOrTitleBlock.text.length > 150 ? '...' : '');
    } else if (firstTextOrTitleBlock.type === 'title') {
      excerpt = firstTextOrTitleBlock.text.substring(0, 150) + (firstTextOrTitleBlock.text.length > 150 ? '...' : '');
    }
  }


  return (
    <div>
      <Link to={`/post/${post.slug}`} className="block overflow-hidden" aria-label={`Read more about ${post.title}`}>
        <img 
            className="w-full aspect-[4/5] object-cover" 
            src={post.imageUrl} 
            alt={post.title} 
            loading="lazy"
        />
      </Link>
      <div className="pt-5 pb-2">
        <h3 className="text-2xl font-serif font-bold mb-2.5 text-neutral-900 leading-tight tracking-tight">
          <Link to={`/post/${post.slug}`} className="hover:text-neutral-600 transition-colors line-clamp-3">{post.title}</Link>
        </h3>
        <p className="text-neutral-700 text-base mb-4 leading-relaxed line-clamp-3 font-sans">{excerpt}</p>
        <Link
          to={`/post/${post.slug}`}
          className="text-sm font-semibold text-neutral-900 hover:text-neutral-700 transition-colors underline underline-offset-4 font-sans tracking-wide"
        >
          Read now
        </Link>
      </div>
    </div>
  );
};


interface HeroPostCardProps {
  post: Post;
}

export const HeroPostCard: React.FC<HeroPostCardProps> = ({ post }) => {
  return (
    <div className="relative w-full h-[70vh] bg-cover bg-center text-white" style={{ backgroundImage: `url(${post.imageUrl})` }}>
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="relative z-10 text-center flex flex-col items-center">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 max-w-4xl leading-tight shadow-black/50 text-shadow">
            <Link to={`/post/${post.slug}`} className="hover:opacity-90 transition-opacity">{post.title}</Link>
            </h1>
            <Link
            to={`/post/${post.slug}`}
            className="px-8 py-3 bg-white text-neutral-900 text-sm font-semibold uppercase tracking-wider rounded-sm hover:bg-opacity-90 transition-colors"
            >
            Read Story
            </Link>
        </div>
      </div>
    </div>
  );
};

export const AdBanner: React.FC = () => {
  return (
    <div 
        className="w-full h-[300px] bg-neutral-200 my-10 md:my-12 flex items-center justify-center"
        role="complementary" 
        aria-label="Advertisement Banner"
    >
      <p className="text-neutral-500 text-lg font-semibold">Advertisement Banner</p>
    </div>
  );
};

interface PostFullProps {
  post: Post;
  relatedPosts: Post[];
}


const SliderBlockComponent: React.FC<{ block: SliderBlock, postTitle: string }> = ({ block, postTitle }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollPrev(el.scrollLeft > 5);
      setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      updateScrollability();
      el.addEventListener('scroll', updateScrollability);
      window.addEventListener('resize', updateScrollability);
      return () => {
        el.removeEventListener('scroll', updateScrollability);
        window.removeEventListener('resize', updateScrollability);
      };
    }
  }, [updateScrollability]);

  const scrollHandler = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      let slideWidthEstimate = el.clientWidth * 0.8; // Fallback for w-[80%]
      // This is a rough way to get slide width; a more robust method would be to measure a slide child.
      // For now, this heuristic might work if w-[80%] or sm:w-[75%] are the dominant mobile widths.
      if (window.innerWidth < 640 && el.querySelector(':scope > div')?.classList.contains('sm:w-[75%]')) {
         slideWidthEstimate = el.clientWidth * 0.75;
      } else if (window.innerWidth < 640) {
         slideWidthEstimate = el.clientWidth * 0.8;
      } else {
         // For desktop, scroll by approx one visible item width
         const firstSlideChild = el.querySelector(':scope > div') as HTMLElement;
         if(firstSlideChild) slideWidthEstimate = firstSlideChild.offsetWidth;
      }
      
      const scrollAmount = direction === 'left' ? -slideWidthEstimate : slideWidthEstimate;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  if (!block.slides || block.slides.length === 0) return null;

  // Determine slide item classes based on number of slides and screen size
  let slideItemClasses = "flex-shrink-0 snap-center ";
  let imageClasses = "object-contain ";

  if (block.slides.length === 1) {
    // Single Slide
    slideItemClasses += "w-full md:w-auto md:max-w-2xl lg:max-w-3xl md:mx-auto md:flex md:justify-center";
    imageClasses += "w-full h-auto md:w-auto md:h-auto md:max-h-[70vh]";
  } else {
    // Multiple Slides
    slideItemClasses += "w-[80%] sm:w-[75%] "; // Mobile: Peek effect
    // Desktop: 2 or 3+ slides across
    if (block.slides.length === 2) {
      slideItemClasses += "md:w-[calc((100%-0.625rem)/2)]";
    } else { // 3 or more slides
      slideItemClasses += "md:w-[calc((100%-2*0.625rem)/3)]";
    }
    imageClasses += "w-full h-auto"; // Image takes full width of its container, height is auto
  }


  return (
    <div key={block.id} className="my-8 md:my-12 relative">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-2 px-2 md:px-0 
                   space-x-2.5 
                   snap-x snap-mandatory md:snap-none" // 10px gap
      >
        {block.slides.map((slide, index) => (
          <div
            key={slide.id}
            className={slideItemClasses}
          >
            {slide.linkUrl ? (
              <a href={slide.linkUrl} target="_blank" rel="noopener noreferrer" className="block group w-full h-full">
                <img
                  src={slide.imageUrl}
                  alt={`Slide ${index + 1} from ${postTitle}`}
                  className={`${imageClasses} transition-transform duration-300 md:group-hover:scale-105`}
                  loading="lazy"
                />
              </a>
            ) : (
              <img
                src={slide.imageUrl}
                alt={`Slide ${index + 1} from ${postTitle}`}
                className={imageClasses}
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
      {/* Mobile Navigation Arrows - only if more than 1 slide */}
      {block.slides.length > 1 && (
        <>
          <button
            onClick={() => scrollHandler('left')}
            disabled={!canScrollPrev}
            className="absolute left-1.5 sm:left-2.5 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-opacity duration-300 md:hidden disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollHandler('right')}
            disabled={!canScrollNext}
            className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-opacity duration-300 md:hidden disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};


export const PostFull: React.FC<PostFullProps> = ({ post, relatedPosts }) => {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-neutral-500">
        <Link to="/" className="hover:text-neutral-700">Home</Link>
        <span className="mx-1">/</span>
        <Link to={`/category/${post.category}`} className="hover:text-neutral-700">{post.category}</Link>
      </div>

      <div className="relative w-full h-[65vh] md:h-[75vh] bg-cover bg-center text-white mb-8 md:mb-12" style={{ backgroundImage: `url(${post.imageUrl})` }}>
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center p-6 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold max-w-4xl leading-tight">
            {post.title}
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center mb-8 md:mb-12">
        <p className="text-neutral-600 text-sm">
          By <span className="font-semibold text-neutral-800">{post.author}</span>
          <span className="mx-2">&bull;</span>
          {formatDate(post.date)}
        </p>
      </div>

      {/* Container for content blocks */}
      {post.content.map((block) => {
        if (block.type === 'slider') {
          // Slider takes full container width, SliderBlockComponent itself will handle internal sizing.
          return (
            <div key={block.id} className="container mx-auto px-0 sm:px-0 lg:px-0"> 
               <SliderBlockComponent block={block as SliderBlock} postTitle={post.title} />
            </div>
          );
        }
        // Other blocks are wrapped in the max-w-3xl container
        return (
          <div key={block.id} className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl font-serif text-neutral-800">
            <div className="prose prose-lg lg:prose-xl max-w-none prose-img:shadow-md prose-img:my-8 space-y-6">
              {block.type === 'text' && <p className="text-lg md:text-xl leading-relaxed md:leading-loose">{block.text}</p>}
              {block.type === 'title' && React.createElement(`h${block.level}`, { className: 'font-semibold text-neutral-800 mt-6 mb-3' }, block.text)}
              {block.type === 'button' && (
                <div className="my-8 text-center">
                  <a href={(block as ButtonBlock).linkUrl}
                     target="_blank" rel="noopener noreferrer"
                     className="inline-block bg-neutral-800 text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider rounded-sm hover:bg-neutral-700 transition-colors">
                    {(block as ButtonBlock).text || 'Learn More'}
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}


      {relatedPosts && relatedPosts.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <hr className="my-8 md:my-10 border-neutral-200" />
          <h2 className="text-2xl md:text-3xl font-semibold font-serif text-neutral-800 mb-8 md:mb-10 text-center">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {relatedPosts.map(relatedPost => (
              <PostCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-neutral-50 py-12 md:py-16 mt-12 md:mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <div className="w-24 h-24 bg-neutral-300 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl text-neutral-500 font-serif">{post.author.charAt(0)}</span>
          </div>
          <h3 className="text-xl font-semibold font-serif text-neutral-800 mb-2">{post.author}</h3>
          <p className="text-neutral-600 text-sm leading-relaxed max-w-md mx-auto">
            {post.author} is a contributing writer at OPUMO, focusing on {post.category.toLowerCase()} and lifestyle. With a keen eye for detail and a passion for storytelling, {post.author} brings unique perspectives to the latest trends and timeless classics.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- AUTH & ADMIN COMPONENTS ---
export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-lg shadow-xl border border-neutral-200/80">
        <div>
          <h2 className="mt-6 text-center text-2xl font-semibold font-serif text-neutral-800">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="username-address" className="sr-only">Username</label>
              <input id="username-address" name="username" type="text" autoComplete="username" required
                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-t-md focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 focus:z-10 sm:text-sm"
                placeholder="Username (admin)" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required
                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-neutral-300 placeholder-neutral-500 text-neutral-900 rounded-b-md focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 focus:z-10 sm:text-sm"
                placeholder="Password (admin)" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div>
            <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BlockEditorControls: React.FC<{
  blockId: string;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ blockId, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  return (
    <div className="flex items-center space-x-1.5 mt-1.5 mb-2">
      <button type="button" onClick={onDelete} title="Delete block" className="p-1.5 text-red-500 hover:text-red-700 transition-colors rounded-md hover:bg-red-100">
        <TrashIcon /> 
      </button>
      {onMoveUp && (
        <button type="button" onClick={onMoveUp} disabled={isFirst} title="Move block up" className="p-1.5 text-neutral-500 hover:text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-neutral-100">
          <ArrowUpIcon /> 
        </button>
      )}
      {onMoveDown && (
        <button type="button" onClick={onMoveDown} disabled={isLast} title="Move block down" className="p-1.5 text-neutral-500 hover:text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md hover:bg-neutral-100">
          <ArrowDownIcon /> 
        </button>
      )}
    </div>
  );
};


export const EditPostForm: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { getPostBySlug, updatePost, addPost } = usePosts();
  
  const isCreating = !slug;

  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<PostCategory>(PostCategory.GENERAL);
  const [imageUrl, setImageUrl] = useState('');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(!isCreating);
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false);
  const addBlockButtonRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    if (slug && !isCreating) {
      setIsLoading(true);
      const postToEdit = getPostBySlug(slug);
      if (postToEdit) {
        setCurrentPostId(postToEdit.id);
        setTitle(postToEdit.title);
        setAuthor(postToEdit.author);
        setCategory(postToEdit.category);
        setImageUrl(postToEdit.imageUrl);
        setContentBlocks(Array.isArray(postToEdit.content) ? postToEdit.content : []);
      } else {
        alert('Post not found.');
        navigate('/admin');
      }
      setIsLoading(false);
    } else {
      setContentBlocks([{ id: generateBlockId(), type: 'text', text: '' }]);
      setIsLoading(false);
    }
  }, [slug, getPostBySlug, navigate, isCreating]);

  const handleAddBlock = (type: ContentBlockType) => {
    let newBlock: ContentBlock;
    const newId = generateBlockId();
    if (type === 'text') {
      newBlock = { id: newId, type: 'text', text: '' };
    } else if (type === 'title') {
      newBlock = { id: newId, type: 'title', text: '', level: 2 };
    } else if (type === 'slider') {
      newBlock = { id: newId, type: 'slider', slides: [{ id: generateBlockId(), imageUrl: '', linkUrl: '' }] };
    } else if (type === 'button') {
      newBlock = { id: newId, type: 'button', text: '', linkUrl: '#' };
    }
     else {
      return; 
    }
    setContentBlocks(prev => [...prev, newBlock]);
    setShowAddBlockMenu(false);
  };

  const handleUpdateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(prevBlocks =>
      prevBlocks.map(currentBlock => {
        if (currentBlock.id === id) {
          if (currentBlock.type === 'text' && updates.type === 'text') {
            return { ...currentBlock, ...updates as Partial<TextBlock> };
          } else if (currentBlock.type === 'title' && updates.type === 'title') {
             const newTitleBlock = { ...currentBlock, ...updates as Partial<TitleBlock> };
             if (typeof newTitleBlock.level !== 'number' || ![2,3,4].includes(newTitleBlock.level)) {
                newTitleBlock.level = currentBlock.level;
             }
             return newTitleBlock;
          } else if (currentBlock.type === 'slider' && updates.type === 'slider') {
            return { ...currentBlock, ...updates as Partial<SliderBlock> };
          } else if (currentBlock.type === 'button' && updates.type === 'button') {
            return { ...currentBlock, ...updates as Partial<ButtonBlock> };
          }
          return currentBlock; 
        }
        return currentBlock;
      })
    );
  };

  const handleDeleteBlock = (id: string) => {
    setContentBlocks(prev => prev.filter(block => block.id !== id));
  };
  
  const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
    setContentBlocks(prev => {
      const index = prev.findIndex(block => block.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newBlocks = [...prev];
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[newIndex];
      newBlocks[newIndex] = temp;
      return newBlocks;
    });
  };

  const handleUpdateSlide = (blockId: string, slideId: string, field: keyof Omit<ImageSlide, 'id'>, value: string) => {
    setContentBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === blockId && block.type === 'slider') {
          const updatedSlides = block.slides.map(slide =>
            slide.id === slideId ? { ...slide, [field]: value } : slide
          );
          return { ...block, slides: updatedSlides };
        }
        return block;
      })
    );
  };

  const handleAddSlide = (blockId: string) => {
    setContentBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === blockId && block.type === 'slider') {
          return {
            ...block,
            slides: [...block.slides, { id: generateBlockId(), imageUrl: '', linkUrl: '' }],
          };
        }
        return block;
      })
    );
  };

  const handleDeleteSlide = (blockId: string, slideId: string) => {
    setContentBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block.id === blockId && block.type === 'slider') {
          return {
            ...block,
            slides: block.slides.filter(slide => slide.id !== slideId),
          };
        }
        return block;
      })
    );
  };


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !imageUrl.trim()) {
        alert("Post Title, Author, and Main Image URL are required.");
        return;
    }
    if (contentBlocks.length === 0) {
        alert("Post content cannot be empty. Please add at least one content block.");
        return;
    }
    
    const finalContentBlocks = contentBlocks.map(block => {
        if (block.type === 'text' && !block.text.trim()) return {...block, text: ""}; 
        if (block.type === 'title' && !block.text.trim()) return {...block, text: "Untitled"};
        if (block.type === 'slider') {
            const validSlides = block.slides.filter(slide => slide.imageUrl.trim() !== '');
            if (validSlides.length === 0) return null; 
            return {...block, slides: validSlides };
        }
        if (block.type === 'button' && (!block.text.trim() || !block.linkUrl.trim())) return null; 
        return block;
    }).filter(Boolean) as ContentBlock[]; 

    if (finalContentBlocks.length === 0 && contentBlocks.length > 0) {
        alert("Some content blocks were incomplete and removed. Ensure all required fields are filled.");
    }
    if (finalContentBlocks.length === 0) {
      alert("Post content cannot be empty after validation. Please add valid content blocks.");
      return;
    }


    const newSlug = slugifyAsUtil(title) || `post-${Date.now()}`;

    if (isCreating) {
      const createdPost = addPost({ title, content: finalContentBlocks, author, category, imageUrl });
      alert('Post created successfully!');
      navigate(`/admin/edit/${createdPost.slug}`);
    } else if (currentPostId) {
      const updatedPost: Post = {
        id: currentPostId,
        title,
        content: finalContentBlocks,
        author,
        category,
        imageUrl,
        slug: newSlug,
        date: getPostBySlug(slug as string)?.date || new Date().toISOString(), 
      };
      updatePost(updatedPost);
      alert('Post updated successfully!');
      if (slug !== newSlug) {
        navigate(`/admin/edit/${newSlug}`);
      }
    }
  };

  if (isLoading) return <Spinner message={isCreating ? "Preparing editor..." : "Loading post data..."} />;

  return (
     <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-neutral-200/80">
      <h2 className="text-xl md:text-2xl font-semibold font-serif text-neutral-800 mb-6 md:mb-8">
        {isCreating ? 'Create New Post' : `Edit Post: ${title || ''}`}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Meta Fields */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-neutral-700 mb-1">Author</label>
          <input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value as PostCategory)} required className="block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm rounded-md">
            {Object.values(PostCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-1">Main Image URL (for Hero)</label>
          <input type="url" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm" />
          {imageUrl && <img src={imageUrl} alt="Preview" className="mt-3 max-h-48 rounded-md shadow-sm" loading="lazy"/>}
        </div>

        {/* Content Blocks Editor */}
        <div className="space-y-5 border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-medium text-neutral-700 mb-1">Content Blocks</h3>
          {contentBlocks.map((block, index) => (
            <div key={block.id} className="p-4 border border-neutral-200 rounded-md bg-neutral-50/50">
              {block.type === 'text' && (
                <div>
                  <label htmlFor={`text-${block.id}`} className="block text-xs font-medium text-neutral-600 mb-1">Text Block</label>
                  <textarea id={`text-${block.id}`} value={(block as TextBlock).text}
                    onChange={(e) => handleUpdateBlock(block.id, { type: 'text', text: e.target.value })}
                    rows={5} className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm leading-relaxed" />
                </div>
              )}
              {block.type === 'title' && (
                <div className="space-y-2">
                  <label htmlFor={`title-text-${block.id}`} className="block text-xs font-medium text-neutral-600">Title Block</label>
                  <input type="text" id={`title-text-${block.id}`} value={(block as TitleBlock).text}
                    onChange={(e) => handleUpdateBlock(block.id, { type: 'title', text: e.target.value })}
                    placeholder="Enter title text"
                    className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm" />
                  <select value={(block as TitleBlock).level}
                    onChange={(e) => handleUpdateBlock(block.id, { type: 'title', level: parseInt(e.target.value) as TitleBlock['level'] })}
                    className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm rounded-md">
                    <option value="2">Heading 2 (H2)</option>
                    <option value="3">Heading 3 (H3)</option>
                    <option value="4">Heading 4 (H4)</option>
                  </select>
                </div>
              )}
              {block.type === 'slider' && (
                <div className="space-y-3">
                    <label className="block text-xs font-medium text-neutral-600">Image Slider Block</label>
                    {(block as SliderBlock).slides.map((slide, slideIndex) => (
                        <div key={slide.id} className="p-3 border border-neutral-300 rounded bg-white space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-neutral-500">Slide {slideIndex + 1}</p>
                                <button type="button" onClick={() => handleDeleteSlide(block.id, slide.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100">
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div>
                                <label htmlFor={`slide-img-${slide.id}`} className="text-xs font-medium text-neutral-600">Image URL</label>
                                <input type="url" id={`slide-img-${slide.id}`} value={slide.imageUrl}
                                    onChange={(e) => handleUpdateSlide(block.id, slide.id, 'imageUrl', e.target.value)}
                                    placeholder="https://example.com/image.jpg" required
                                    className="mt-0.5 block w-full px-3 py-1.5 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm" />
                                {slide.imageUrl && <img src={slide.imageUrl} alt={`Preview slide ${slideIndex + 1}`} className="mt-2 max-h-32 rounded shadow-sm" loading="lazy"/>}
                            </div>
                             <div>
                                <label htmlFor={`slide-link-${slide.id}`} className="text-xs font-medium text-neutral-600">Link URL (Optional)</label>
                                <input type="url" id={`slide-link-${slide.id}`} value={slide.linkUrl || ''}
                                    onChange={(e) => handleUpdateSlide(block.id, slide.id, 'linkUrl', e.target.value)}
                                    placeholder="https://example.com/link-destination"
                                    className="mt-0.5 block w-full px-3 py-1.5 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm" />
                            </div>
                        </div>
                    ))}
                     <button type="button" onClick={() => handleAddSlide(block.id)}
                        className="mt-1 w-full flex items-center justify-center px-3 py-1.5 border border-dashed border-neutral-300 rounded-md text-xs font-medium text-neutral-500 hover:border-neutral-400 hover:text-neutral-600 transition-colors">
                        <PlusIcon className="mr-1.5 w-4 h-4" /> Add Another Slide
                    </button>
                </div>
              )}
              {block.type === 'button' && (
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-neutral-600">Button Block</label>
                    <div>
                        <label htmlFor={`btn-text-${block.id}`} className="text-xs font-medium text-neutral-600">Button Text</label>
                        <input type="text" id={`btn-text-${block.id}`} value={(block as ButtonBlock).text}
                            onChange={(e) => handleUpdateBlock(block.id, { type:'button', text: e.target.value })}
                            placeholder="Enter button text" required
                            className="mt-0.5 block w-full px-3 py-1.5 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor={`btn-link-${block.id}`} className="text-xs font-medium text-neutral-600">Button Link URL</label>
                        <input type="url" id={`btn-link-${block.id}`} value={(block as ButtonBlock).linkUrl}
                             onChange={(e) => handleUpdateBlock(block.id, { type:'button', linkUrl: e.target.value })}
                            placeholder="https://example.com/destination" required
                            className="mt-0.5 block w-full px-3 py-1.5 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-neutral-500 focus:border-neutral-500 sm:text-sm" />
                    </div>
                </div>
              )}
              <BlockEditorControls 
                blockId={block.id}
                onDelete={() => handleDeleteBlock(block.id)}
                onMoveUp={index > 0 ? () => handleMoveBlock(block.id, 'up') : undefined}
                onMoveDown={index < contentBlocks.length - 1 ? () => handleMoveBlock(block.id, 'down') : undefined}
                isFirst={index === 0}
                isLast={index === contentBlocks.length - 1}
              />
            </div>
          ))}
          
          <div className="relative">
            <button 
              ref={addBlockButtonRef}
              type="button" 
              onClick={() => setShowAddBlockMenu(prev => !prev)}
              className="mt-2 w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-neutral-300 rounded-md text-sm font-medium text-neutral-600 hover:border-neutral-400 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors"
            >
              <PlusIcon className="mr-2" /> Add Content Block
            </button>
            {showAddBlockMenu && (
              <div className="absolute left-0 mt-1 w-full sm:w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button type="button" onClick={() => handleAddBlock('text')} className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900" role="menuitem">
                    Text Block
                  </button>
                  <button type="button" onClick={() => handleAddBlock('title')} className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900" role="menuitem">
                    Title Block
                  </button>
                   <button type="button" onClick={() => handleAddBlock('slider')} className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900" role="menuitem">
                    Image Slider
                  </button>
                  <button type="button" onClick={() => handleAddBlock('button')} className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900" role="menuitem">
                    Button
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => navigate('/admin')} className="px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors">
                Cancel
            </button>
            <button type="submit" className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors">
                {isCreating ? 'Create Post' : 'Save Changes'}
            </button>
        </div>
      </form>
    </div>
  );
};

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner message="Checking authentication..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const Spinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-[250px] text-neutral-600 py-10">
    <svg className="animate-spin h-10 w-10 text-neutral-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-lg font-medium">{message}</p>
  </div>
);

export const AdminPostRow: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <tr className="border-b border-neutral-200 hover:bg-neutral-50/80 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">{post.title}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{post.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{formatDate(post.date)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link to={`/admin/edit/${post.slug}`} className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium">
          Edit
        </Link>
      </td>
    </tr>
  );
};
