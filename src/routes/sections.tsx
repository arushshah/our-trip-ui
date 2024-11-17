import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import ProtectedRoute from 'src/routes/components/ProtectedRoute'; // Import the ProtectedRoute component
import { AuthProvider } from 'src/context/AuthContext'; // Import the AuthProvider
import { ViewItinerary } from '../sections/itinerary/view-itinerary';

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
const TravelDocsPage = lazy(() => import('src/pages/all-travel-docs'));
const CreateTravelDocPage = lazy(() => import('src/pages/create-travel-doc'));
const InvitesPage = lazy(() => import('src/pages/all-invites'));
const ViewInvitePage = lazy(() => import('src/pages/view-invite'));
const InvitationRedirectPage = lazy(() => import('src/pages/invitation-redirect'));
const ViewGuestsPage = lazy(() => import('src/pages/view-guests'));
const TodoListPage = lazy(() => import('src/pages/todo-list'));
const ExpensesPage = lazy(() => import('src/pages/expenses'));
const LocationsPage = lazy(() => import ('src/pages/locations'));
const ItineraryPage = lazy(() => import('src/pages/itinerary'));
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
        { path: '/', element: <Navigate to="/home" replace /> }, // Added redirection from '/' to '/home'
        { path: 'home', element: <HomePage /> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'create-trip', element: <CreateTripPage /> },
        { path: 'view-trip/:trip_id', element: <ViewTripPage /> },
        { path: 'update-trip/:trip_id', element: <UpdateTripPage /> },
        { path: 'accommodations/:trip_id', element: <AccommodationsPage /> },
        { path: 'create-accommodation/:trip_id', element: <CreateAccommodationPage /> },
        { path: 'travel-docs/:trip_id', element: <TravelDocsPage /> },
        { path: 'create-travel-doc/:trip_id', element: <CreateTravelDocPage /> },
        { path: '/trip-invites', element: <InvitesPage /> },
        { path: '/view-invite/:trip_id', element: <ViewInvitePage /> },
        { path: '/invitation/:token', element: <InvitationRedirectPage /> },
        { path: '/view-guests/:trip_id', element: <ViewGuestsPage /> },
        { path: '/todo-list/:trip_id', element: <TodoListPage /> },
        { path: '/expenses/:trip_id', element: <ExpensesPage /> },
        { path: '/saved-locations/:trip_id', element: <LocationsPage /> },
        { path: '/itinerary/:trip_id', element: <ItineraryPage /> },
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