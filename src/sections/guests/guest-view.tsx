import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  CircularProgress
} from '@mui/material';
import { apiUrl } from 'src/config';

interface Guest {
  guest_username: string;
  guest_first_name: string;
  guest_last_name: string;
  is_host: boolean;
  rsvp_status: string;
}

interface GuestViewProps {
  trip_id: string;
  show_invited_guests?: boolean;
  is_host: boolean;
}

export default function GuestView({ trip_id, show_invited_guests }: GuestViewProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [guestToDelete, setGuestToDelete] = useState<string | null>(null);

  const fetchTripDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('idToken');
      if (!token) {
        throw new Error('No access token found');
      }
      const response = await fetch(`${apiUrl}/trip_guests/get-trip-guests?trip_id=${trip_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!show_invited_guests) {
        data.guests = data.guests.filter((guest: Guest) => guest.rsvp_status === 'YES' || guest.rsvp_status === "MAYBE");
      }
      setGuests(data.guests);
      setLoading(false);
      console.log(data.guests);
    } catch (error) {
      console.error('Error fetching trip details:', error);
      setLoading(false);
    }
  }, [trip_id, show_invited_guests]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  const handleDelete = async (guest_username: string) => {
    console.log(guest_username);
    try {
      await axios.delete(`${apiUrl}/trip_guests/delete-trip-guest`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('idToken')}`,
        },
        data: { to_delete_username: guest_username, trip_id }
      });
      setOpenDialog(false); // Close the dialog after deletion
      fetchTripDetails();
    } catch (error) {
      console.error('Error deleting guest:', error);
    }
  };

  const handleOpenDialog = (guest_username: string) => {
    console.log(guest_username);
    setGuestToDelete(guest_username);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setGuestToDelete(null);
  };

  return (
    <>
      <Box sx={{ p: 3, color: 'white' }}>
        <Typography variant="h2" sx={{ mb: 3, color: 'white' }}>Trip Guests</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white', backgroundColor: '#222831', fontSize: '1.5em' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', backgroundColor: '#222831', fontSize: '1.5em' }}>RSVP</TableCell>
              <TableCell sx={{ color: 'white', backgroundColor: '#222831', fontSize: '1.5em' }}>Host</TableCell>
              <TableCell sx={{ color: 'white', backgroundColor: '#222831', fontSize: '1.5em' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guests.length > 0 ? (
              guests.map((guest) => (
                <TableRow key={guest.guest_username}>
                  <TableCell sx={{ color: 'white', fontSize: '1em' }}>
                    {guest.guest_first_name} {guest.guest_last_name}
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontSize: '1em' }}>{guest.rsvp_status}</TableCell>
                  <TableCell sx={{ color: 'white', fontSize: '1em' }}>
                    {guest.is_host ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell>
                    {!guest.is_host &&
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleOpenDialog(guest.guest_username)}
                      sx={{ color: 'error.main' }}
                    >
                      <Typography variant="h6">X</Typography>
                    </IconButton>
                    }
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="no-guests">
                <TableCell colSpan={5} sx={{ color: 'white' }}>No guests found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ color: 'black' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: 'black' }}>
            Are you sure you want to delete this guest from the trip?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: 'black' }}>Cancel</Button>
          <Button
            onClick={() => {
              if (guestToDelete) {
                handleDelete(guestToDelete);
              }
            }}
            sx={{ color: 'error.main' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
