
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Beaker, ChevronLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      setPageTitle('All Products');
    } else if (location.pathname.includes('/analysis')) {
      setPageTitle('Product Analysis');
    } else if (location.pathname === '/reports') {
      setPageTitle('Reports');
    } else if (location.pathname === '/profile') {
      setPageTitle('Profile');
    }
  }, [location]);

  const isAnalysisPage = location.pathname.includes('/analysis');

  return (
    <header 
      className={`sticky top-0 z-50 w-full px-4 sm:px-6 transition-all duration-300 ${
        scrolled 
          ? 'py-3 shadow-subtle bg-white/80 dark:bg-chemical-900/80 backdrop-blur-md' 
          : 'py-4 bg-white/60 dark:bg-chemical-900/60 backdrop-blur-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isAnalysisPage && (
            <button 
              onClick={() => navigate('/')}
              className="mr-2 p-2 rounded-full text-chemical-700 dark:text-chemical-300 hover:text-chemical-900 dark:hover:text-white hover:bg-chemical-50 dark:hover:bg-chemical-800 transition-colors duration-200"
              aria-label="Back to products"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-display font-medium text-chemical-900 dark:text-white">
              {pageTitle}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
