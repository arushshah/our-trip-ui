import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  // Add other properties if needed
}

interface Trip {
  trip_name: string;
  trip_description: string;
  trip_start_date: string;
  trip_end_date: string;
}

export function UpdateTripView() {
  const { trip_id } = useParams<{ trip_id: string }>();
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formattedStartDate = new Date(trip.trip_start_date).toLocaleDateString();
    const formattedEndDate = new Date(trip.trip_end_date).toLocaleDateString();

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }
      const decodedToken: DecodedToken = jwtDecode(token);
      const userId = decodedToken.sub;

      const response = await fetch(`http://127.0.0.1:5000/trips/update-trip`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip_id,
          trip_name: trip.trip_name,
          trip_description: trip.trip_description,
          trip_start_date: formattedStartDate,
          trip_end_date: formattedEndDate,
          trip_hostname: userId,
        }),
      });

      if (response.ok) {
        navigate('/', { state: { message: 'Trip Successfully Updated' } });
      } else {
        console.error('Failed to update trip');
      }
    } catch (error) {
      console.error('Error updating trip:', error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTrip((prevTrip) => ({ ...prevTrip, [name]: value }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (!trip) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Edit Trip
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Trip Name"
          name="trip_name"
          variant="outlined"
          sx={{ mb: 2 }}
          value={trip.trip_name}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Description"
          name="trip_description"
          variant="outlined"
          sx={{ mb: 2 }}
          value={trip.trip_description}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Start Date"
          name="trip_start_date"
          type="date"
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          sx={{ mb: 2 }}
          value={formatDate(trip.trip_start_date)}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="End Date"
          name="trip_end_date"
          type="date"
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          sx={{ mb: 2 }}
          value={formatDate(trip.trip_end_date)}
          onChange={handleChange}
        />
        <Button type="submit" variant="contained" color="primary">
          Update Trip
        </Button>
      </form>
    </Box>
  );
}