import { useEffect, useState } from 'react';
import { Link, Link as RouterLink } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import {apiUrl} from 'src/config';
import { _tasks, _posts, _timeline } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { getAuth } from 'firebase/auth';
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

export function AllUserInvitesView() {

  const [userTrips, setUserTrips] = useState<UserTrip[]>([]);
  const [userId, setUserId] = useState<string>('');
  const {idToken, user} = useAuth();

  useEffect(() => {

    const fetchUserTrips = async () => {
      try {

        const auth = getAuth();
        
        const response = await fetch(`${apiUrl}/trips/get-user-trips`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          }
        });
        const data = await response.json();
        // filter data.trips to only include trips with rsvp_status of "INVITED"
        const invitedTrips = data.trips.filter((trip: UserTrip) => trip.rsvp_status === 'INVITED');

        const formattedTrips = invitedTrips.map((trip: UserTrip) => ({
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
      }
    };
    fetchUserTrips();
  }, [userId, idToken]);
  
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
        Hi, Welcome back {user?.firstName ?? 'Guest'}
      </Typography>
      
      <Typography variant="h3" sx={{ mb: 2 }}>
        Here are your invites
      </Typography>

      <Grid container spacing={3}>
        {userTrips.map((trip, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Link to={`/view-invite/${trip.trip_id}`} style={{ textDecoration: 'none' }}>
            <UserTripEntry post={{ trip_id: trip.trip_id, title: trip.trip_name, trip_description: trip.trip_description, trip_start_date: trip.trip_start_date, trip_end_date: trip.trip_end_date, author: {name: "test", avatarUrl: "/assets/images/avatar/avatar-25.webp"} }} latestPost latestPostLarge/>
            </Link>
          </Grid>
        ))}
      </Grid>

    </DashboardContent>
    </Box>
  );
}
