import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Grid, Typography } from '@mui/material';

import { _tasks, _posts, _timeline } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { jwtDecode } from 'jwt-decode';
import { UserTripEntry } from './user-trip-entry';
import { CreateTripEntry } from './create-trip-entry';

interface UserTrip {
  trip_name: string;
  trip_start_date: string;
  trip_end_date: string;
  trip_id: string;
  trip_description: string;
  // Add other properties as needed
}
interface DecodedToken {
  sub: string;
  // Add other properties as needed
}

export function AllAccommodationsView() {

  const [userTrips, setUserTrips] = useState<UserTrip[]>([]);

  useEffect(() => {

    const fetchUserTrips = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No access token found');
        }
        const decodedToken: DecodedToken = jwtDecode(token);
        const userId = decodedToken.sub;
        
        const response = await fetch(`http://127.0.0.1:5000/trips/get-user-trips?user_id=${userId}`);
        const data = await response.json();
        
        const formattedTrips = data.trips.map((trip: UserTrip) => ({
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
  }, []);
  
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>
      
       
      <Typography variant="h3" sx={{ mb: 2 }}>
        Here are your booked accommodations
      </Typography>

      <Grid container spacing={3}>
        {userTrips.map((trip, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <UserTripEntry trip_id={trip.trip_id} title={trip.trip_name} trip_description={trip.trip_description} trip_start_date={trip.trip_start_date} trip_end_date={trip.trip_end_date}/>
          </Grid>
        ))}
      </Grid>

      <br />
      <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={6}>
        <RouterLink to="/create-accommodation" style={{ textDecoration: 'none' }}>
            <CreateTripEntry title="+ Add an accommodation"/>
        </RouterLink>
        </Grid>
      </Grid>

    </DashboardContent>
  );
}
