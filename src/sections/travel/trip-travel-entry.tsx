import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Palette, PaletteColor, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {apiUrl} from 'src/config';

interface TripTravelEntryProps {
  trip_id: string;
  file_name: string;
  color?: keyof Palette;
  sx?: object;
  renderTrending?: React.ReactNode;
  onDelete: (fileName: string) => void; // Add onDelete prop
  [key: string]: any;
}

export function TripTravelEntry({
  trip_id,
  file_name,
  color = 'primary',
  sx,
  renderTrending,
  onDelete,
  ...other
}: TripTravelEntryProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);


  useEffect(() => {
    const fetchPresignedUrls = async () => {

        try {
            const downloadResponse = await axios.post(`${apiUrl}/user_uploads/generate-presigned-url`, 
                {
                    file_name,
                    trip_id,
                    url_type: "download",
                    document_category: "travel"
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('idToken')}`,
                    }
                }, 
            );

            const downloadUrl = downloadResponse.data.download_url;

            // Fetch the file from S3 using the presigned URL
            const fileResponse = await axios.get(downloadUrl, {
                responseType: 'blob', // Important to get the file as a blob
            });
            // get the upload date
            setLastModified(fileResponse.headers['last-modified']);
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
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(file_name); // Call the onDelete callback
    setIsConfirmDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  return (
    <>
    <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} onClick={handleClick}>
      <Box sx={{ position: 'relative', paddingBottom: '50%', width: '100%' }}>
        <CardMedia
            component="img"
            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
            image={fileUrl || undefined}
        />
      </Box>
      <CardContent sx={{ flex: '1 0 auto', textAlign: 'center', overflow: 'hidden' }}>
        <Typography gutterBottom variant="h5" component="div" noWrap sx={{ fontSize: { xs: '0.75rem', sm: '1rem', md: '1.25rem' } }}>
          {file_name}
        </Typography>
        <Typography variant="body2" noWrap sx={{ color: 'text.secondary', fontSize: { xs: '0.25 rem', sm: '.5rem', md: '.75rem' } }}>
          Last Modified: {lastModified}
        </Typography>
      </CardContent>
      <br />
      <br />
      <CardActions sx={{ justifyContent: 'flex-end', position: 'absolute', bottom: 0, right: 0 }}>
          <Button
            size="small"
            onClick={handleDelete}
            sx={{
              color: '#c31217',
            }}
          >
            <DeleteIcon />
          </Button>
        </CardActions>
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

    <Dialog open={isConfirmDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this file?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}