import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import GuestView from 'src/sections/guests/view/guest-view';
import BackButtonView from 'src/layouts/components/back-button';
import {apiUrl} from 'src/config';

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

export function ViewInviteView() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  
  const location = useLocation();
  const [trip, setTrip] = useState<Trip>({
    trip_name: location.state?.title || '',
    trip_description: location.state?.trip_description || '',
    trip_start_date: location.state?.trip_start_date || '',
    trip_end_date: location.state?.trip_end_date || '',
  });
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvpResponse, setRsvpResponse] = React.useState('INVITED');

  const handleChange = (event: SelectChangeEvent) => {
    setRsvpResponse(event.target.value as string);
    
    const updateRsvpStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/trip_guests/update-rsvp-status`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trip_id,
            rsvp_status: event.target.value,
          }),
        });
        if (response.ok) {
          console.info('RSVP status updated');
        } else {
          console.error('Failed to update RSVP status');
        }
      } catch (error) {
        console.error('Error updating RSVP status:', error);
      }
    }
    updateRsvpStatus();
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
          trip_name: data.trip_details.trip_name || prevTrip.trip_name,
          trip_description: data.trip_details.trip_description || prevTrip.trip_description,
          trip_start_date: data.trip_details.trip_start_date || prevTrip.trip_start_date,
          trip_end_date: data.trip_details.trip_end_date || prevTrip.trip_end_date,
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
        const response = await fetch(`${apiUrl}/trip_guests/get-trip-guests?trip_id=${trip_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },
        });
        const data = await response.json();
        setGuests(data.guests);
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };
    fetchTripDetails();
  }, [trip_id]);

  if (!trip) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3, color: 'white'}}>
      <BackButtonView />
      <Typography variant="h2" sx={{ mb: 3 }}>
            You&apos;re invited!
        </Typography>
        <Typography variant="h4" sx={{ mb: 3 }}>
            Here are the deets
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
        <GuestView trip_id={trip_id} />
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to={`/accommodations/${trip_id}`}
        >
          View Accommodation Documents
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to={`/travel-docs/${trip_id}`}
        >
          View Travel Documents
        </Button>
        <br />
        <br />
        
        <Typography variant="h4" sx={{ mb: 3 }}>
          RSVP here
        </Typography>
        <FormControl sx={{minWidth: 200}}>
          <InputLabel>RSVP</InputLabel>
            <Select
              value={rsvpResponse}
              label="RSVP"
              onChange={handleChange}
              sx={{
                color: 'white', // Change the text color to white
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white', // Change the border color to white
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white', // Change the border color to white when focused
                },
                '.MuiSvgIcon-root': {
                  color: 'white', // Change the dropdown icon color to white
                },
              }}
              inputProps={{
                style: { color: 'white' }, // Change the input text color to white
              }}
            >
              <MenuItem value="YES">Yes</MenuItem>
              <MenuItem value="NO">No</MenuItem>
              <MenuItem value="MAYBE">Maybe</MenuItem>
            </Select>
      </FormControl>
    </Box>
  );
}