import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, Button, TextField, Snackbar, Alert } from '@mui/material';
import BackButtonView from 'src/layouts/components/back-button';
import { useParams } from 'react-router-dom';
import {apiUrl} from 'src/config';

const CreateTravelDocView: React.FC = () => {
  const { trip_id } = useParams<{ trip_id: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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

        const response = await axios.post(`${apiUrl}/user_uploads/generate-presigned-url`,
            {
                file_name: file.name,
                file_type: file.type,
                trip_id,
                url_type: "upload",
                document_category: "travel"
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('idToken')}`,
                },
            }
        );
        const { url } = response.data;

        if (!url) {
            throw new Error('Invalid response from server');
        }

      setPresignedUrl(url);

      // Upload the file to S3 using PUT request
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

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

  return (
    <Box sx={{ p: 3, color: 'white' }}>
        <BackButtonView />
      <Typography variant="h4" sx={{ mb: 3 }}>
        Add Document
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
          InputProps={{
            style: { color: '#EEEEEE' },
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

export default CreateTravelDocView;