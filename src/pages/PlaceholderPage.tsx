import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export const PlaceholderPage = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = `${location.pathname} - Smart Society`;
  }, [location.pathname]);

  // Extract page name from path
  const getPageName = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    const lastSegment = segments[segments.length - 1];
    // Convert kebab-case to Title Case
    return lastSegment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const pageName = getPageName(location.pathname);

  return (
    <div className="p-6 bg-primary-background-color min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-primary-white border border-primary-gray rounded-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-primary-black mb-4">{pageName}</h1>
          <p className="text-base text-primary-black/70 mb-2">
            Route: <code className="bg-primary-gray/20 px-2 py-1 rounded">{location.pathname}</code>
          </p>
          <p className="text-sm text-primary-gray mt-4">
            This page is coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

