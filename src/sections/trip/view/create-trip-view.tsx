import React, { useState, useRef } from 'react';
import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BackButtonView from 'src/layouts/components/back-button';
import {apiUrl} from 'src/config';

export function CreateTripView() {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('idToken');
      if (!token) {
        throw new Error('No access token found');
      }

      // format the dates as a string in mm/dd/yyyy
      const formattedStartDate = new Date(startDate).toLocaleDateString();
      const formattedEndDate = new Date(endDate).toLocaleDateString();

      const response = await fetch(`${apiUrl}/trips/create-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          trip_name: tripName,
          trip_description: tripDescription,
          trip_start_date: formattedStartDate,
          trip_end_date: formattedEndDate
        }),
      });

      if (response.ok) {
        // Redirect to the home page with a success message
        navigate('/', { state: { message: 'Trip Successfully Created' } });
      } else {
        console.error('Failed to create trip');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
    }
  };

  return (
    <Box sx={{ p: 3, color: "#EEEEEE" }} >
      <BackButtonView />
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
          InputProps={{
            style: { color: '#EEEEEE' },
          }}
        />
        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          sx={{ mb: 2 }}
          value={tripDescription}
          onChange={(e) => setTripDescription(e.target.value)}
          InputProps={{
            style: { color: '#EEEEEE' },
          }}
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
          InputProps={{
            style: { color: '#EEEEEE' }
          }}
          inputRef={startDateRef}
          onFocus={() => startDateRef.current?.showPicker()} // Use showPicker to open the calendar
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
          InputProps={{
            style: { color: '#EEEEEE' },
          }}
          inputRef={endDateRef}
          onFocus={() => endDateRef.current?.showPicker()} // Use showPicker to open the calendar
        />
        <Button type="submit" variant="contained" color="primary">
          Create Trip
        </Button>
      </form>
    </Box>
  );
}
