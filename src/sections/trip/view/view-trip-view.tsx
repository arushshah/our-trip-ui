import React, { useEffect, useState } from 'react';
import {apiUrl} from 'src/config';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, InputAdornment } from '@mui/material';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import ViewTripViewNavbar from './view-trip-view-navbar';


interface Trip {
  trip_name: string;
  trip_description: string;
  trip_start_date: string;
  trip_end_date: string;
  trip_token: string;
}

export function ViewTripView() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  
  const location = useLocation();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip>({
    trip_name: location.state?.title || '',
    trip_description: location.state?.trip_description || '',
    trip_start_date: location.state?.trip_start_date || '',
    trip_end_date: location.state?.trip_end_date || '',
    trip_token: location.state?.trip_token || '',
  });
  interface Guest {
    rsvp_status: string;
    is_host: boolean;
  }
  
  const [guestInfo, setGuestInfo] = useState<Guest>();
  const [rsvpResponse, setRsvpResponse] = React.useState('');

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
          trip_token: data.trip_details.trip_token || prevTrip.trip_token,
        }));
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };
    const getGuestInfo = async () => {
      try {
        const response = await fetch(`${apiUrl}/trip_guests/get-guest-info?trip_id=${trip_id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          }
        });
        const data = await response.json();
        setGuestInfo(data.guest);
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };
    fetchTripDetails();
    getGuestInfo();
  }, [trip_id]);

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

  const handleDeleteClick = async () => {
    try {
      await axios.delete(`${apiUrl}/trips/delete-trip`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('idToken')}`,
        },
        params: {
          trip_id
        }
      });
      // Redirect to another page or update the UI after successful deletion
      navigate('/'); // Redirect to trips list page
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  if (!trip) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
    <ViewTripViewNavbar trip_id={trip_id} />
    <Box sx={{ p: 3, color: 'white', position: 'relative'}}>
        <Button
          variant="contained"
          sx={{
            position: 'absolute',
            top: 40,
            right: 16,
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#20C997',
            '&:hover': {
                  backgroundColor: '#17A589',
                },
          }}
          onClick={handleEditClick}
          >
          Edit Trip
      </Button>
        <Box sx={{ mb: 2 }}>
            <Typography variant="h1">{trip.trip_name}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
            <Typography variant="h3" color="textSecondary">
                About This Trip
            </Typography>
            <Typography variant="h4">{trip.trip_description}</Typography>
        </Box>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>
            <Typography variant="h3" color="textSecondary">
              From
            </Typography>
            <Typography variant="h4">{formatDate(trip.trip_start_date)}</Typography>
          </Box>
          <Box sx={{marginLeft: '30px'}}>
            <Typography variant="h3" color="textSecondary">
              To
            </Typography>
            <Typography variant="h4">{formatDate(trip.trip_end_date)}</Typography>
          </Box>
        </Box>
        { guestInfo?.is_host === false ? 
        <>
          <Typography variant="h4" sx={{ mb: 3 }}>
          RSVP here
        </Typography>
        <FormControl sx={{minWidth: 200}}>
          <InputLabel>RSVP</InputLabel>
            <Select
              value={rsvpResponse === '' ? guestInfo?.rsvp_status ?? '' : rsvpResponse}
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
      </>
      : <></>}
      <br />
      <br />
      <Typography variant="h4" sx={{ mb: 3 }}>
          Trip Invite Link
        </Typography>
        <Box sx={{ display: 'inline-block' }}>
          <TextField
            label="Invite Link"
            variant="outlined"
            value={`localhost:3039/invitation/${trip.trip_token}`}
            InputProps={{
              style: { color: '#EEEEEE', width: '45em' },
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#20C997', // Teal color for Copy button
                      '&:hover': {
                        backgroundColor: '#17A589', // Darker teal on hover
                      },
                    }}
                    onClick={() => navigator.clipboard.writeText(`localhost:3039/invitation/${trip.trip_token}`)}
                  >
                    Copy
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      <br />
      <br />
      <Button
        variant="contained"
        color="error"
        onClick={handleDeleteClick}
        sx={{
          backgroundColor: '#DC3545', // Red color for Delete button
          '&:hover': {
            backgroundColor: '#C82333', // Darker red on hover
          },
        }}
      >
        Delete Trip
      </Button>
    </Box>
    </>
  );
}