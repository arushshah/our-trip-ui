import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Card, Dialog, DialogContent, DialogTitle, IconButton, Palette, PaletteColor, Typography } from '@mui/material';
import {apiUrl} from 'src/config';

interface TripAccommodationEntryProps {
  trip_id: string;
  file_name: string;
  color?: keyof Palette;
  sx?: object;
  renderTrending?: React.ReactNode;
  onDelete: (fileName: string) => void; // Add onDelete prop
  [key: string]: any;
}

export function TripAccommodationEntry({
  trip_id,
  file_name,
  color = 'primary',
  sx,
  renderTrending,
  onDelete,
  ...other
}: TripAccommodationEntryProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchPresignedUrls = async () => {

        try {
        // Fetch the presigned URL from your backend for downloading the file
            const downloadResponse = await axios.post(`${apiUrl}/user_uploads/generate-presigned-url`,
              {
                file_name,
                trip_id,
                url_type: "download",
                document_category: "accommodation"
              }, 
              {
                headers:  {
                  Authorization: `Bearer ${localStorage.getItem('idToken')}`,
                },
            });

            const downloadUrl = downloadResponse.data.download_url;

            // Fetch the file from S3 using the presigned URL
            const fileResponse = await axios.get(downloadUrl, {
                responseType: 'blob', // Important to get the file as a blob
            });
            setFileUrl(downloadUrl)

      } catch (error) {
        console.error('Error fetching presigned URLs or downloading file:', error);
      }
    };

    fetchPresignedUrls();
  }, [file_name, trip_id, fileUrl]);

  const handleClick = () => {
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        onDelete(file_name); // Call the onDelete callback
      } catch (error) {
        console.error('Error fetching presigned URLs or downloading file:', error);
      }
    };

  return (
    <>
      <Card
        sx={{
          p: 3,
          boxShadow: 'none',
          position: 'relative',
          color: (theme) => (theme.palette[color] as PaletteColor)?.darker || theme.palette.primary.darker,
          backgroundColor: (theme) => (theme.palette[color] as PaletteColor)?.lighter || theme.palette.primary.lighter,
          height: '100px',
          ...sx,
        }}
        {...other}
        onClick={handleClick}
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
            <Box sx={{ mb: 1, typography: 'h3' }}>{file_name}</Box>
          </Box>
        </Box>

        <IconButton
          aria-label="delete"
          onClick={handleDelete}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: (theme) => theme.palette.error.main,
          }}
        >
          <Typography variant="h6">X</Typography> {/* Use text-based delete button */}
        </IconButton>
      </Card>

      <Dialog open={isDialogOpen} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Typography variant="h6">X</Typography> {/* Use text-based close button */}
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
          }}
        >
          {fileUrl && (
            <img
              src={fileUrl}
              alt={file_name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}