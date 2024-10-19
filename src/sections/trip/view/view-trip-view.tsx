import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import GuestView from 'src/layouts/components/guest-view';

interface DecodedToken {
  sub: string;
  // Add other properties if needed
}

interface Guest {
  guest_username: string;
  guest_first_name: string;
  guest_last_name: string;
  is_host: boolean;
}

interface Trip {
  trip_name: string;
  trip_description: string;
  trip_start_date: string;
  trip_end_date: string;
  guests?: Guest[];
}

export function ViewTripView() {
  const { trip_id } = useParams<{ trip_id: string }>();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip>({
    trip_name: location.state?.title || '',
    trip_description: location.state?.trip_description || '',
    trip_start_date: location.state?.trip_start_date || '',
    trip_end_date: location.state?.trip_end_date || '',
  });

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/trips/get-trip?trip_id=${trip_id}`);
        const data = await response.json();
        setTrip((prevTrip) => ({
          ...prevTrip,
          trip_name: data.trip_name || prevTrip.trip_name,
          trip_description: data.trip_description || prevTrip.trip_description,
          trip_start_date: data.trip_start_date || prevTrip.trip_start_date,
          trip_end_date: data.trip_end_date || prevTrip.trip_end_date,
        }));
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };
    fetchTripDetails();
  }, [trip_id]);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/trip_guests/get-trip-guests?trip_id=${trip_id}`);
        const data = await response.json();
        setGuests(data.guests);
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };
    fetchTripDetails();
  }, [trip_id]);
  console.log(guests);

  const handleEditClick = () => {
    navigate(`/update-trip/${trip_id}`, {
      state: {
        title: trip.trip_name,
        trip_description: trip.trip_description,
        trip_start_date: trip.trip_start_date,
        trip_end_date: trip.trip_end_date,
      },
    });
  };
  

  if (!trip) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
            Trip Information
        </Typography>
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="textSecondary">
                Trip Name
            </Typography>
            <Typography variant="body1">{trip.trip_name}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="textSecondary">
                Description
            </Typography>
            <Typography variant="body1">{trip.trip_description}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="textSecondary">
                Start Date
            </Typography>
            <Typography variant="body1">{trip.trip_start_date}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="textSecondary">
                End Date
            </Typography>
            <Typography variant="body1">{trip.trip_end_date}</Typography>
        </Box>
        <GuestView guests={guests || []} />
        <Button
        variant="contained"
        color="primary"
        onClick={handleEditClick}
        >
            Edit Trip
      </Button>
    </Box>
  );
}