import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes/Router';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Suspense
            fallback={
              <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              </div>
            }
          >
            <RouterProvider router={router} />
          </Suspense>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
