import React from 'react';
import { Box, Card, Palette, PaletteColor } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface UserTripEntryProps {
  trip_id: string;
  title: string;
  trip_description: string;
  trip_start_date: string;
  trip_end_date: string;
  color?: keyof Palette;
  sx?: object;
  renderTrending?: React.ReactNode;
  [key: string]: any;
}

export function UserTripEntry({
  trip_id,
  title,
  trip_description,
  trip_start_date,
  trip_end_date,
  color = 'primary',
  sx,
  renderTrending,
  ...other
}: UserTripEntryProps) {
  return (
    <RouterLink
      to={`/view-trip/${trip_id}`}
      style={{ textDecoration: 'none' }}
      state={{ title, trip_description, trip_start_date, trip_end_date }}
    >
      <Card
        sx={{
          p: 3,
          boxShadow: 'none',
          position: 'relative',
          color: (theme) => (theme.palette[color] as PaletteColor)?.darker || theme.palette.primary.darker,
          backgroundColor: (theme) => (theme.palette[color] as PaletteColor)?.lighter || theme.palette.primary.lighter,
          ...sx,
        }}
        {...other}
      >
        {renderTrending}

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 112 }}>
            <Box sx={{ mb: 1, typography: 'h3' }}>{title}</Box>
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 112 }}>
            <Box sx={{ mb: 1, typography: 'body2' }}>
              {trip_start_date} - {trip_end_date}
            </Box>
          </Box>
        </Box>
      </Card>
    </RouterLink>
  );
}