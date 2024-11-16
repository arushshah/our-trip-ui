import { useEffect, useState } from 'react';
import { Link, Link as RouterLink } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import {apiUrl} from 'src/config';
import { _tasks, _posts, _timeline } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';
import { getAuth } from 'firebase/auth';

export function ViewItinerary() {

  const [userId, setUserId] = useState<string>('');
  const [tripStartDate, setTripStartDate] = useState<string>('');
  const [tripEndDate, setTripEndDate] = useState<string>('');

  useEffect(() => {

    const fetchUserTrips = async () => {
      try {

        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
        console.log("REFRESH TOKEN")
        
        const response = await fetch(`${apiUrl}/trips/get-trip`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          }
        });
        const data = await response.json();
        
      } catch (error) {
        console.error('Error fetching user trips:', error);
      }
    };
    fetchUserTrips();
  }, [userId]);
  
  return (
    <Box sx={{ p: 3, color: 'white' }}>

      <Typography variant="h2" sx={{ mb: 2 }}>
        Here is your itinerary
      </Typography>

    </Box>
  );
}
