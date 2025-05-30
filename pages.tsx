
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePosts } from './contexts/PostsContext';
import { PostCard, PostFull, LoginForm, EditPostForm, Spinner, AdminPostRow, HeroPostCard, AdBanner } from './components';
import { Post, PostCategory } from './types';
import { convertPostsToCSV, parseCSVToPosts } from './data';

export const HomePage: React.FC = () => {
  const { posts, isLoading } = usePosts();

  if (isLoading) return <Spinner message="Loading posts..." />;
  
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestPost = sortedPosts.length > 0 ? sortedPosts[0] : null;
  
  const postsToShowInFirstGrid = 3;
  const otherPosts = sortedPosts.slice(1);
  const postsBeforeAd = otherPosts.slice(0, postsToShowInFirstGrid);
  const postsAfterAd = otherPosts.slice(postsToShowInFirstGrid);

  if (!latestPost) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-neutral-600">No posts available yet. Check back soon!</div>;
  }

  return (
    <>
      <HeroPostCard post={latestPost} />

      {postsBeforeAd.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {postsBeforeAd.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {otherPosts.length > 0 && (
          <AdBanner />
      )}

      {postsAfterAd.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {postsAfterAd.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
      
      {latestPost && otherPosts.length === 0 && (
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-neutral-600">
            No other posts available at the moment.
        </div>
      )}
    </>
  );
};

export const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { posts, isLoading } = usePosts();

  if (isLoading) return <Spinner message={`Loading ${categoryName} posts...`} />;

  const validCategory = Object.values(PostCategory).find(c => c.toLowerCase() === categoryName?.toLowerCase());

  if (!validCategory) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-semibold font-serif text-red-700 mb-4">Category Not Found</h2>
        <p className="text-neutral-600">The category "{categoryName}" does not exist.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-neutral-700 hover:text-neutral-900 underline underline-offset-2 transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  const filteredPosts = posts.filter(post => post.category.toLowerCase() === validCategory.toLowerCase());

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      <h1 className="text-2xl md:text-3xl font-semibold font-serif text-neutral-800 mb-8 md:mb-10">Category: {validCategory}</h1>
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-600">No posts found in the {validCategory} category yet.</p>
      )}
    </div>
  );
};

export const SinglePostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { posts: allPosts, getPostBySlug, isLoading: postsLoading } = usePosts();
  
  if (postsLoading) return <Spinner message="Loading post..." />;

  if (!slug) { 
     return <NotFoundPage/>;
  }
  const post = getPostBySlug(slug);

  if (!post) return <NotFoundPage/>;

  // Determine related posts
  let relatedPosts: Post[] = allPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by newest
    .slice(0, 3);

  if (relatedPosts.length < 3) {
      const otherCategoryPosts = allPosts
          .filter(p => p.id !== post.id && p.category !== post.category)
          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3 - relatedPosts.length);
      relatedPosts.push(...otherCategoryPosts);
  }
  
  relatedPosts = relatedPosts.slice(0,3); // Ensure max 3 related posts

  return (
    // Removed container from here, PostFull will manage its own full-width hero vs contained content
    <PostFull post={post} relatedPosts={relatedPosts} />
  );
};

export const LoginPage: React.FC = () => {
  return <LoginForm />;
};

export const AdminDashboardPage: React.FC = () => {
  const { posts, isLoading, processImportedData } = usePosts();
  const [csvFile, setCsvFile] = useState<File | null>(null);

  if (isLoading) return <Spinner message="Loading dashboard..." />;

  const handleExportCSV = () => {
    if (posts.length === 0) {
      alert("No posts to export.");
      return;
    }
    try {
      const csvString = convertPostsToCSV(posts);
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "posts.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
       alert("Posts exported to CSV successfully!");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Error exporting CSV. Check console for details.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
    } else {
      setCsvFile(null);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      alert("Please select a CSV file to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        alert("Could not read file content.");
        return;
      }
      try {
        const importedData = parseCSVToPosts(text);
        if (importedData.length === 0) {
            alert("No data found in CSV or CSV is not correctly formatted.");
            return;
        }
        processImportedData(importedData);
        alert(`Successfully processed ${importedData.length} rows from CSV.`);
        setCsvFile(null); 
        // Reset file input if possible (difficult to do programmatically for security reasons)
        // Consider adding a key to the input to force re-render on successful upload if needed.
      } catch (error) {
        console.error("Error importing CSV:", error);
        alert(`Error importing CSV: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
      }
    };
    reader.onerror = () => {
        alert("Error reading file.");
    }
    reader.readAsText(csvFile);
  };


  return (
    <div className="bg-gray-50 min-h-[calc(100vh-12rem)] py-8 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold font-serif text-neutral-800">Admin Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link 
                to="/admin/new" 
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors text-center"
                aria-label="Create New Post"
            >
              Create New Post
            </Link>
            <button
                onClick={handleExportCSV}
                className="px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-colors"
                aria-label="Download Posts as CSV"
            >
                Download Posts CSV
            </button>
          </div>
        </div>

        <div className="mb-8 p-4 sm:p-6 bg-white shadow-lg rounded-lg border border-neutral-200/80">
          <h2 className="text-lg font-semibold text-neutral-700 mb-3 font-serif">Import Posts from CSV</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              aria-label="Upload CSV file"
              className="block w-full sm:w-auto text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 transition-colors"
            />
            <button
              onClick={handleImportCSV}
              disabled={!csvFile}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              aria-label="Upload and process selected CSV file"
            >
              Upload & Process CSV
            </button>
          </div>
            {csvFile && <p className="text-xs text-neutral-500 mt-2">Selected file: {csvFile.name}</p>}
           <p className="text-xs text-neutral-500 mt-2">
                CSV must include headers: <code className="text-xs bg-neutral-100 p-0.5 rounded">id,slug,title,content,author,date,category,imageUrl</code>.
                <br/> For new posts, 'id', 'slug', 'date' can be omitted (will be auto-generated). 'Content' field should be carefully formatted if it contains commas or newlines for basic CSV parsing.
            </p>
        </div>

        {posts.length > 0 ? (
          <div className="bg-white shadow-xl rounded-lg overflow-x-auto border border-neutral-200/80">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {posts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(post => (
                  <AdminPostRow key={post.id} post={post} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-600 text-lg">No posts to manage yet.</p>
            <p className="text-neutral-500 mt-2">Why not create your first one or import from CSV?</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminFormContainer: React.FC<{children: React.ReactNode}> = ({children}) => (
    <div className="bg-gray-50 min-h-[calc(100vh-12rem)] py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            {children}
        </div>
    </div>
);

export const AdminNewPostPage: React.FC = () => {
  return (
    <AdminFormContainer>
      <EditPostForm />
    </AdminFormContainer>
  );
};

export const AdminEditPostPage: React.FC = () => {
  return (
    <AdminFormContainer>
      <EditPostForm />
    </AdminFormContainer>
  );
};

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 bg-gray-50">
      <svg className="w-20 h-20 text-neutral-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
      <h1 className="text-5xl font-bold font-serif text-neutral-800 mb-3">404</h1>
      <h2 className="text-xl md:text-2xl font-semibold text-neutral-700 mb-3">Page Not Found</h2>
      <p className="text-neutral-600 mb-8 max-w-md">
        Oops! The page you're looking for doesn't seem to exist. It might have been moved or deleted.
      </p>
      <Link 
        to="/" 
        className="px-5 py-2.5 bg-neutral-800 text-white font-medium text-sm rounded-md shadow-sm hover:bg-neutral-700 transition-colors duration-300 ease-in-out"
      >
        Go Back to Homepage
      </Link>
    </div>
  );
};
