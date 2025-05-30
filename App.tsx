import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PostsProvider } from './contexts/PostsContext';
import { Navbar, Footer, ProtectedRoute } from './components';
import { 
  HomePage, 
  CategoryPage, 
  SinglePostPage, 
  LoginPage, 
  AdminDashboardPage, 
  AdminEditPostPage, 
  AdminNewPostPage,
  NotFoundPage 
} from './pages';
import ApiWebhookPage from './ApiWebhookPage'; // Import the new webhook page

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <PostsProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/post/:slug" element={<SinglePostPage />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Route for the Make.com webhook. Not protected. */}
                <Route path="/api/posts/webhook" element={<ApiWebhookPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/new" element={<AdminNewPostPage />} />
                  <Route path="/admin/edit/:slug" element={<AdminEditPostPage />} />
                </Route>
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </PostsProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;