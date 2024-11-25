import React, { useCallback, useEffect, useState } from 'react';
import {apiUrl} from 'src/config';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, InputAdornment, DialogActions, Dialog, DialogContent, DialogContentText, DialogTitle, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from 'src/context/AuthContext';

interface Trip {
  trip_name: string;
  trip_description: string;
  trip_start_date: string;
  trip_end_date: string;
  trip_token: string;
}

interface Guest {
  guest_username: string;
  guest_first_name: string;
  guest_last_name: string;
  is_host: boolean;
  rsvp_status: string;
}

export function ViewTripView() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  const [guestInfo, setGuestInfo] = useState<Guest>();
  const [guests, setGuests] = useState<Guest[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip>({
    trip_name: location.state?.title || '',
    trip_description: location.state?.trip_description || '',
    trip_start_date: location.state?.trip_start_date || '',
    trip_end_date: location.state?.trip_end_date || '',
    trip_token: location.state?.trip_token || '',
  });

  const [rsvpResponse, setRsvpResponse] = React.useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [openNewHostDialog, setOpenNewHostDialog] = useState(false);
  const [selectedNewHost, setSelectedNewHost] = useState('');
  const {idToken} = useAuth();
  const [loading, setLoading] = useState(true); // Add loading state

  
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleOpenLeaveDialog = () => {
    setOpenLeaveDialog(true);
  };

  const handleCloseLeaveDialog = () => {
    setOpenLeaveDialog(false);
  };

  const handleConfirmDelete = () => {
    handleDeleteClick();
    setOpenDeleteDialog(false);
  };

  const handleConfirmLeave = () => {
    if (guestInfo?.is_host) {
      setOpenLeaveDialog(false);
      setOpenNewHostDialog(true);
    } else {
      handleLeaveClick();
      setOpenLeaveDialog(false);
    }
  };

  const handleNewHostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedNewHost((event.target as HTMLInputElement).value);
  };

  const handleConfirmNewHost = async () => {
    try {
      await fetch(`${apiUrl}/trip_guests/set-new-host`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip_id,
          new_host_id: selectedNewHost,
        }),
      });
      handleLeaveClick();
    } catch (error) {
      console.error('Error leaving trip:', error);
    }
    setOpenNewHostDialog(false);
  };

  const formatDate = (dateString: string) => {
    
    // Parse the mm/dd/yyyy date string
    const [month, day, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day); // Create a Date object
  
    // Define options for formatting the date
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    
    // Format the date to "Month Day, Year"
    return date.toLocaleDateString(undefined, options);
  };

  const handleChange = (event: SelectChangeEvent) => {
    setRsvpResponse(event.target.value as string);
    
    const updateRsvpStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/trip_guests/update-rsvp-status`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${idToken}`,
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
            Authorization: `Bearer ${idToken}`,
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
    const fetchGuestList = async () => {
      try {
        if (!idToken) {
          throw new Error('No access token found');
        }
        const response = await fetch(`${apiUrl}/trip_guests/get-trip-guests?trip_id=${trip_id}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const decoded_token = jwtDecode<{ user_id: string }>(idToken);
        const data = await response.json();
        data.guests = data.guests.filter((guest: Guest) => guest.rsvp_status === 'YES');
        setGuests(data.guests);
        setGuestInfo(data.guests.find((guest: Guest) => guest.guest_username === decoded_token.user_id));
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };

    Promise.all([fetchTripDetails(), fetchGuestList()])
    .then(() => setLoading(false)) // Set loading to false after both complete
    .catch((error) => console.error('Error fetching trip data:', error));
}, [trip_id, idToken]);

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
      await fetch(`${apiUrl}/trips/delete-trip`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip_id,
        }),
      });
      navigate('/home'); // Redirect to trips list page
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const handleLeaveClick = async () => {
    try {
      await fetch(`${apiUrl}/trip_guests/delete-trip-guest`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trip_id,
        }),
      });
      navigate('/home'); // Redirect to trips list page
    } catch (error) {
      console.error('Error leaving trip:', error);
    }
  };

  if (!trip) {
    return <Typography>Loading...</Typography>;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#222831',
          color: '#EEEEEE',
        }}
      >
        <CircularProgress sx={{ color: '#00BFFF' }} />
        <Typography variant="h4" sx={{ ml: 2 }}>
          Loading Trip Details...
        </Typography>
      </Box>
    );
  }
  return (
    <>
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
      {guestInfo?.is_host === true && (
        <>
          <Button
            variant="contained"
            color="error"
            onClick={handleOpenDeleteDialog}
            sx={{
              backgroundColor: '#DC3545', // Red color for Delete button
              '&:hover': {
                backgroundColor: '#C82333', // Darker red on hover
              },
              mr: 2, // Add right margin to the Delete button
            }}
          >
            Delete Trip
          </Button>
          <Dialog
            open={openDeleteDialog}
            onClose={handleCloseDeleteDialog}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText id="delete-dialog-description">
                Are you sure you want to delete this trip? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      <Button
        variant="contained"
        color="error"
        onClick={handleOpenLeaveDialog}
        sx={{
          backgroundColor: '#DC3545', // Red color for Leave button
          '&:hover': {
            backgroundColor: '#C82333', // Darker red on hover
          },
        }}
      >
        Leave Trip
      </Button>
      <Dialog
        open={openLeaveDialog}
        onClose={handleCloseLeaveDialog}
        aria-labelledby="leave-dialog-title"
        aria-describedby="leave-dialog-description"
      >
        <DialogTitle id="leave-dialog-title">Confirm Leave</DialogTitle>
        <DialogContent>
          <DialogContentText id="leave-dialog-description">
            Are you sure you want to leave this trip?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLeaveDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLeave} color="error">
            Leave
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openNewHostDialog}
        onClose={() => setOpenNewHostDialog(false)}
        aria-labelledby="new-host-dialog-title"
        aria-describedby="new-host-dialog-description"
      >
        <DialogTitle id="new-host-dialog-title">Select New Host</DialogTitle>
        <DialogContent>
          <DialogContentText id="new-host-dialog-description">
            Please select a new host for this trip.
          </DialogContentText>
          <RadioGroup value={selectedNewHost} onChange={handleNewHostChange}>
            {guests.map((guest) => 
              guest.guest_username !== guestInfo?.guest_username &&     
              (
                <FormControlLabel
                  key={guest.guest_username}
                  value={guest.guest_username}
                  control={<Radio />}
                  label={`${guest.guest_first_name} ${guest.guest_last_name}`}
                />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewHostDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmNewHost} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  );
}