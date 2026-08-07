import React from 'react';
import { Link } from 'react-router';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-cream-50 text-primary-800">
      <h1 className="text-6xl font-bold text-gold-500">404</h1>
      <p className="mt-2 text-xl font-medium">Page Not Found</p>
      <p className="mt-1 text-sm text-gray-500">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 bg-primary-800 text-white px-6 py-2.5 rounded-full hover:bg-primary-900 transition-all font-medium text-sm">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
