import { useEffect, useState } from 'react';
import { Link, Link as RouterLink } from 'react-router-dom';
import { Box, CircularProgress, Fab, Grid, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { apiUrl } from 'src/config';
import { DashboardContent } from 'src/layouts/dashboard';
import { useAuth } from 'src/context/AuthContext';
import { UserTripEntry } from './user-trip-entry';

interface UserTrip {
  trip_name: string;
  trip_start_date: string;
  trip_end_date: string;
  trip_id: string;
  trip_description: string;
  rsvp_status: string;
}

export function AllUserTripsView() {
  const [userTrips, setUserTrips] = useState<UserTrip[]>([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const { idToken, user } = useAuth();

  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        console.log("fetching user trips");
        setLoading(true); // Start loading

        const response = await fetch(`${apiUrl}/trips/get-user-trips`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const data = await response.json();

        const trips = data.trips.filter((trip: UserTrip) => trip.rsvp_status !== 'INVITED');

        const formattedTrips = trips.map((trip: UserTrip) => ({
          ...trip,
          trip_start_date: new Date(trip.trip_start_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          trip_end_date: new Date(trip.trip_end_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        }));

        setUserTrips(formattedTrips);
      } catch (error) {
        console.error('Error fetching user trips:', error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchUserTrips();
  }, [idToken]);

  if (loading) {
    // Display a loading spinner or screen while data is being fetched
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#222831', // Background color
          color: '#EEEEEE',
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#222831', // Set your desired background color here
        color: "#EEEEEE",
        padding: 3,
      }}
    >
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Hi, welcome back {user?.firstName}!
        </Typography>

        <Typography variant="h3" sx={{ mb: 2 }}>
          {userTrips.length === 0 ? 'You have no upcoming trips' : 'Here are your upcoming trips'}
        </Typography>

        <Grid container spacing={3}>
          {userTrips.map((trip, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Link to={`/view-trip/${trip.trip_id}`} style={{ textDecoration: 'none' }}>
                <UserTripEntry
                  post={{
                    trip_id: trip.trip_id,
                    title: trip.trip_name,
                    trip_description: trip.trip_description,
                    trip_start_date: trip.trip_start_date,
                    trip_end_date: trip.trip_end_date,
                    author: { name: "test", avatarUrl: "/assets/images/avatar/avatar-25.webp" },
                  }}
                  latestPost
                  latestPostLarge
                />
              </Link>
            </Grid>
          ))}
        </Grid>

        <br />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <RouterLink to="/create-trip" style={{ textDecoration: 'none' }}>
              <Fab
                variant="extended"
                sx={{
                  backgroundColor: '#00BFFF',
                  '&:hover': { backgroundColor: '#005f8a' },
                  color: 'white',
                }}
              >
                <AddIcon sx={{ mr: 1 }} />
                Create New Trip
              </Fab>
            </RouterLink>
          </Grid>
        </Grid>
      </DashboardContent>
    </Box>
  );
}
