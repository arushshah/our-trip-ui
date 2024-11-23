import React, { useState, useRef } from 'react';
import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BackButtonView from 'src/layouts/components/back-button';
import {apiUrl} from 'src/config';
import { useAuth } from 'src/context/AuthContext';

export function CreateTripView() {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const {idToken} = useAuth();

  const formatDate = (date: string) => {
    const d = new Date(date);
    
    // Use UTC methods to avoid local timezone adjustments
    const month = d.getUTCMonth() + 1;  // getUTCMonth() is zero-based, so we add 1
    const day = d.getUTCDate();
    const year = d.getUTCFullYear();
  
    console.log(month);
    console.log(day);
    console.log(year);

    console.log(`${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`)
    
    // Format the date as mm/dd/yyyy
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (!idToken) {
        throw new Error('No access token found');
      }
      console.log(startDate);
      console.log(endDate);
      const response = await fetch(`${apiUrl}/trips/create-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          trip_name: tripName,
          trip_description: tripDescription,
          trip_start_date: formatDate(startDate),
          trip_end_date: formatDate(endDate)
        }),
      });

      if (response.ok) {
        // Redirect to the home page with a success message
        navigate('/home', { state: { message: 'Trip Successfully Created' } });
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
