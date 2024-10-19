import { lazy, Suspense } from 'react';
import { Outlet, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import ProtectedRoute from 'src/routes/components/ProtectedRoute'; // Import the ProtectedRoute component
import { AuthProvider } from 'src/context/AuthContext'; // Import the AuthProvider

// ----------------------------------------------------------------------

const HomePage = lazy(() => import('src/pages/home'));
const BlogPage = lazy(() => import('src/pages/blog'));
const UserPage = lazy(() => import('src/pages/user'));
const SignInPage = lazy(() => import('src/pages/sign-in'));
const ProductsPage = lazy(() => import('src/pages/products'));
const Page404 = lazy(() => import('src/pages/page-not-found'));
const CreateAccountPage = lazy(() => import('src/pages/create-account'));
const CreateTripPage = lazy(() => import('src/pages/create-trip'));
const UpdateTripPage = lazy(() => import('src/pages/update-trip'));
const ViewTripPage = lazy(() => import('src/pages/view-trip'));
const AccommodationsPage = lazy(() => import('src/pages/all-accommodations'));
const CreateAccommodationPage = lazy(() => import('src/pages/create-accommodation'));

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  return useRoutes([
    {
      element: (
        <AuthProvider>
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={renderFallback}>
                <Outlet />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        </AuthProvider>
      ),
      // Add routes here
      children: [
        { element: <HomePage />, index: true },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'create-trip', element: <CreateTripPage /> },
        { path: 'view-trip/:trip_id', element: <ViewTripPage /> },
        { path: 'update-trip/:trip_id', element: <UpdateTripPage /> },
        { path: 'accommodations', element: <AccommodationsPage /> },
        { path: 'create-accommodation', element: <CreateAccommodationPage /> },
      ],
    },
    {
      path: 'sign-in',
      element: (
        <AuthProvider>
          <AuthLayout>
            <Suspense fallback={renderFallback}>
              <SignInPage />
            </Suspense>
          </AuthLayout>
        </AuthProvider>
      ),
    },
    {
      path: 'create-account',
      element: (
        <AuthProvider>
          <AuthLayout>
            <Suspense fallback={renderFallback}>
              <CreateAccountPage />
            </Suspense>
          </AuthLayout>
        </AuthProvider>
      ),
    },
    {
      path: '*',
      element: (
        <Suspense fallback={renderFallback}>
          <Page404 />
        </Suspense>
      ),
    },
  ]);
}