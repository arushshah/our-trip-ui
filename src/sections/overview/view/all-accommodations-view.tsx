import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import axios from 'axios';
import {apiUrl} from 'src/config';
import { TripAccommodationEntry } from 'src/sections/accommodations/trip-accommodation-entry';
import { CreateTripEntry } from './create-trip-entry';

interface FileObject {
  file_name: string;
  s3_url: string;
}

export function AllAccommodationsView() {
  const { trip_id } = useParams<{ trip_id: string }>();
  const [files, setFiles] = useState<FileObject[]>([]);

  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        const token = localStorage.getItem('idToken');
        if (!token) {
          throw new Error('No access token found');
        }
        
        const params = new URLSearchParams({
          trip_id: trip_id || '',
          document_category: 'accommodation',
        });
        const response = await fetch(`${apiUrl}/user_uploads/retrieve-trip-uploads?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.uploads) {
          setFiles(data.uploads);
        }
      } catch (error) {
        console.error('Error fetching user trips:', error);
      }
    };
    fetchUserTrips();
  }, [trip_id]);

  const handleDelete = async (fileName: string) => {
    try {
      await axios.post(`${apiUrl}/user_uploads/delete-upload`,
        {
          file_name: fileName,
          trip_id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,
          },        
        }
      );
      setFiles((prevFiles) => prevFiles.filter((file) => file.file_name !== fileName));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <>
    <Box sx={{ p: 3, color: 'white' }}>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>

      <Typography variant="h3" sx={{ mb: 2 }}>
        Here are your accommodation documents
      </Typography>

      <Grid container spacing={3}>
        {files.map((file, index) => (
          <Grid item xs={12} sm={6} md={6} key={index} sx={{ display: 'flex' }}>
            <TripAccommodationEntry trip_id={trip_id || ''} file_name={file.file_name} sx={{ flex: 1, height: '100px' }} onDelete={handleDelete} />
          </Grid>
        ))}
      </Grid>

      <br />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={6}>
          <RouterLink to={`/create-accommodation/${trip_id}`} style={{ textDecoration: 'none' }}>
            <CreateTripEntry title="+ Upload new document" sx={{ height: '100px' }} />
          </RouterLink>
        </Grid>
      </Grid>
    </Box>
    </>
  );
}

export default AllAccommodationsView;