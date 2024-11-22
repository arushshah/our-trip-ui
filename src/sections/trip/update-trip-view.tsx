import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import BackButtonView from 'src/layouts/components/back-button';
import GuestView from 'src/sections/guests/guest-view';
import {apiUrl} from 'src/config';
import { jwtDecode } from 'jwt-decode';

interface Trip {
  trip_name: string;
  trip_description: string;
  trip_start_date: string;
  trip_end_date: string;
  trip_host: string;
}

export function UpdateTripView() {
  const { trip_id } = useParams<{ trip_id: string }>();
  const idToken = localStorage.getItem('idToken');
  const curUser = idToken ? jwtDecode<{ user_id: string }>(idToken).user_id : null;
  const location = useLocation();
  const [trip, setTrip] = useState<Trip>({
    trip_name: location.state?.title || '',
    trip_description: location.state?.trip_description || '',
    trip_start_date: location.state?.trip_start_date || '',
    trip_end_date: location.state?.trip_end_date || '',
    trip_host: location.state?.trip_host || '',
  });
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatToMDYYYY = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Use getUTCMonth
    const day = String(date.getUTCDate()).padStart(2, '0'); // Use getUTCDate
    const year = date.getUTCFullYear(); // Use getUTCFullYear
    return `${month}/${day}/${year}`;
  };

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/trips/get-trip?trip_id=${trip_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },
        });
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

    if (errorMessage) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/trips/update-trip`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('idToken')}`,
        },
        body: JSON.stringify({
          trip_id,
          trip_name: trip.trip_name,
          trip_description: trip.trip_description,
          trip_start_date: formatToMDYYYY(trip.trip_start_date),
          trip_end_date: formatToMDYYYY(trip.trip_end_date),
        }),
      });

      if (response.ok) {
        console.info("Updated trip successfully");
        navigate('/home');
        
      } else {
        console.error('Failed to update trip');
      }
    } catch (error) {
      console.error('Error updating trip:', error);
    }
  };
  


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    let formattedValue = value;

    if (name === 'trip_start_date' || name === 'trip_end_date') {
      formattedValue = formatToMDYYYY(value);
    }

    setTrip((prevTrip) => ({ ...prevTrip, [name]: formattedValue }));

    if (name === 'trip_start_date' || name === 'trip_end_date') {
      const startDate = new Date(name === 'trip_start_date' ? value : trip.trip_start_date);
      const endDate = new Date(name === 'trip_end_date' ? value : trip.trip_end_date);

      if (endDate < startDate) {
        setErrorMessage('End date cannot be before start date.');
      } else {
        setErrorMessage(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (!trip) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3, color: '#EEEEEE' }}>
      <BackButtonView />
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
          InputProps={{
            style: { color: '#EEEEEE' },
          }}
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
          InputProps={{
            style: { color: '#EEEEEE' },
          }}
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
          InputProps={{
            style: { color: '#EEEEEE' },
          }}
          inputRef={startDateRef}
          onFocus={() => startDateRef.current?.showPicker()}

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
          InputProps={{
            style: { color: '#EEEEEE' },
          }}
          inputRef={endDateRef}
          onFocus={() => endDateRef.current?.showPicker()}

        />
        {errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
        )}
        <GuestView is_host={curUser === trip.trip_host} trip_id={trip_id || ''} />
        <Button type="submit" variant="contained" color="primary">
          Update Trip
        </Button>
      </form>
    </Box>
  );
}