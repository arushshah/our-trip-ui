import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { Button, Grid, Typography } from '@mui/material';

export default function BackButtonView() {
  const navigate = useNavigate();

  return (
    <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => navigate(-1)}
        sx={{ mb: 2, padding: '4px 8px', fontSize: '0.75rem' }}
      >
        Back
      </Button>
  );
}