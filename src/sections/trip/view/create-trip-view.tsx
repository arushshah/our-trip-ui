import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export function CreateTripView() {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.sub;

      // format the dates as a string in mm/dd/yyyy
      const formattedStartDate = new Date(startDate).toLocaleDateString();
      const formattedEndDate = new Date(endDate).toLocaleDateString();

      const response = await fetch('http://127.0.0.1:5000/trips/create-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip_name: tripName,
          trip_description: tripDescription,
          trip_start_date: formattedStartDate,
          trip_end_date: formattedEndDate,
          trip_hostname: userId
        }),
      });

      if (response.ok) {
        // Redirect to the home page with a success message
        navigate('/', { state: { message: 'Trip Successfully Created' } });
      } else {
        console.log(await response.json());
        console.error('Failed to create trip');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Create a New Trip
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Trip Name"
          variant="outlined"
          sx={{ mb: 2 }}
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
        />
        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          sx={{ mb: 2 }}
          value={tripDescription}
          onChange={(e) => setTripDescription(e.target.value)}
        />
        <TextField
          fullWidth
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          sx={{ mb: 2 }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          fullWidth
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          sx={{ mb: 2 }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary">
          Create Trip
        </Button>
      </form>
    </Box>
  );
}