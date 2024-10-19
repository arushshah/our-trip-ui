import React from 'react';

import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

interface Guest {
    guest_username: string;
    guest_first_name: string;
    guest_last_name: string;
    is_host: boolean;
}

interface GuestViewProps {
    guests: Guest[];
}
  
const GuestView: React.FC<GuestViewProps> = ({ guests }) => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Trip Guests
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Host</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.guest_username}>
              <TableCell>{guest.guest_first_name}</TableCell>
              <TableCell>{guest.guest_last_name}</TableCell>
              <TableCell>{guest.guest_username}</TableCell>
              <TableCell>{guest.is_host ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );

  export default GuestView;