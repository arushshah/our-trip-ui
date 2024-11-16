import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Grid, Typography } from '@mui/material';
import axios from 'axios';
import { _tasks, _posts, _timeline } from 'src/_mock';
import { apiUrl } from 'src/config';
import { TripTravelEntry } from 'src/sections/travel/trip-travel-entry';

interface FileObject {
  file_name: string;
  s3_url: string;
}

export function AllTravelDocsView() {
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
            document_category: 'travel',
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
        });
      setFiles((prevFiles) => prevFiles.filter((file) => file.file_name !== fileName));
    } catch (error) {
        console.error('Error deleting file:', error);
    }
  };

  return (
    <Box sx={{ p: 3, color: 'white' }}>

      <Typography variant="h2" sx={{ mb: 2 }}>
        Here are your travel documents
      </Typography>

      <Grid container spacing={5}>
        {files.map((file, index) => (
          <Grid item xs={4} sm={4} md={4} key={index} sx={{ display: 'flex' }}>
            <TripTravelEntry trip_id={trip_id || ''} file_name={file.file_name} sx={{ flex: 1, height: '100px' }} onDelete={handleDelete} />
          </Grid>
        ))}
      </Grid>

      <br />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={6}>
        <Button
              component={RouterLink}
              to={`/create-travel-doc/${trip_id}`}
              variant="outlined"
              sx={{
                borderColor: 'white',
                color: 'white',
                fontSize: '1.25rem', // Increase font size
                padding: '12px 24px', // Increase padding
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light background on hover
                },
              }}
            >
              Upload new document
            </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AllTravelDocsView;