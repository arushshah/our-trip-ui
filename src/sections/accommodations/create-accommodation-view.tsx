import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, Button, TextField, Snackbar, Alert } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

const CreateAccommodationView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found');
    }
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.sub;
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage('No file selected');
      return;
    }

    setUploading(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/user_uploads/generate-presigned-url', {
        file_name: file.name,
        user_username: userId,
        file_type: file.type,
        trip_id: '1' // Replace with actual trip ID
      });

      const { url } = response.data;

      if (!url) {
        throw new Error('Invalid response from server');
      }

      setPresignedUrl(url);

      // Log the presigned URL and file details
      console.log('Presigned URL:', url);
      console.log('File:', file);
      console.log('Content-Type:', file.type);

      // Upload the file to S3 using PUT request
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      console.log('File uploaded successfully');
      setSuccessMessage('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Error uploading file');
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Add Accommodation Details
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          type="file"
          onChange={handleFileChange}
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button type="submit" variant="contained" color="primary" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </form>
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}

    </Box>
  );
};

export default CreateAccommodationView;