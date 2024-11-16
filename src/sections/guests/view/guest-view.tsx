import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, IconButton, TextField, Button, CircularProgress } from '@mui/material';
import {apiUrl} from 'src/config';

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
}

export default function GuestView({ trip_id, show_invited_guests }: GuestViewProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    } catch (error) {
      console.error('Error fetching trip details:', error);
      setLoading(false);
    }
  }, [trip_id, show_invited_guests]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  const handleDelete = async (guest_username: string) => {
    try {
      await axios.delete(`{${apiUrl}/trip_guests/delete-trip-guest`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('idToken')}`,
        },
        data: { trip_guest_username: guest_username, trip_id }
      });
      fetchTripDetails();
    } catch (error) {
      console.error('Error deleting guest:', error);
    }
  };

  return (
    <>
    <Box sx={{ p: 3, color: 'white' }}>
      <Typography variant="h4" sx={{ mb: 3, color: 'white' }}>Trip Guests</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: 'white', backgroundColor: '#222831' }}>First Name</TableCell>
            <TableCell sx={{ color: 'white', backgroundColor: '#222831' }}>Last Name</TableCell>
            <TableCell sx={{ color: 'white', backgroundColor: '#222831' }}>Username</TableCell>
            <TableCell sx={{ color: 'white', backgroundColor: '#222831' }}>RSVP Status</TableCell>
            <TableCell sx={{ color: 'white', backgroundColor: '#222831' }}>Host</TableCell>
            <TableCell sx={{ color: 'white', backgroundColor: '#222831' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {guests.length > 0 ? (
            guests.map((guest) => (
              <TableRow key={guest.guest_username}>
                <TableCell sx={{ color: 'white' }}>{guest.guest_first_name}</TableCell>
                <TableCell sx={{ color: 'white' }}>{guest.guest_last_name}</TableCell>
                <TableCell sx={{ color: 'white' }}>{guest.guest_username}</TableCell>
                <TableCell sx={{ color: 'white' }}>{guest.rsvp_status}</TableCell>
                <TableCell sx={{ color: 'white' }}>{guest.is_host ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleDelete(guest.guest_username)}
                    sx={{ color: 'error.main' }}
                  >
                    <Typography variant="h6">X</Typography>
                  </IconButton>
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
    </>
  );
}
