import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Palette, PaletteColor, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {apiUrl} from 'src/config';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import WordViewer from 'src/components/WordViewer';
import ExcelViewer from 'src/components/ExcelViewer';

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
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresignedUrls = async () => {

        try {
          const downloadResponse = await axios.post(`${apiUrl}/user_uploads/generate-presigned-url`, 
              {
                  file_name,
                  trip_id,
                  url_type: "download",
                  document_category: "accommodation"
              },
              {
                  headers: {
                      Authorization: `Bearer ${localStorage.getItem('idToken')}`,
                  }
              }, 
          );

          const downloadUrl = downloadResponse.data.download_url;
          setFileUrl(downloadUrl)
          if (file_name.endsWith('.docx')) {
            // Generate a thumbnail for DOCX files (a small preview or first 200 characters)
            const response = await axios.get(downloadUrl, {
              responseType: 'arraybuffer',
            });
            const arrayBuffer = response.data;
            const result = await mammoth.convertToHtml({ arrayBuffer });

            // Here we just take the first 200 characters for preview
            const previewText = result.value.slice(0, 200);
            const previewImage = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="20" font-size="12" fill="black">${encodeURIComponent(previewText)}</text></svg>`;
            // Set the preview thumbnail (SVG image containing text)
            setThumbnailUrl(previewImage);
          } else if (file_name.endsWith('.xlsx') || file_name.endsWith('.xls')) {
            // Generate a thumbnail for Excel files
            const response = await axios.get(downloadUrl, {
              responseType: 'arraybuffer',
            });
            const arrayBuffer = response.data;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetNames = workbook.SheetNames;
            const sheet = workbook.Sheets[sheetNames[0]];
            const htmlString = XLSX.utils.sheet_to_html(sheet);
            
            // Use a slice of the Excel sheet for the thumbnail preview
            setThumbnailUrl(htmlString.slice(0, 200)); 
          }
          // Fetch the file from S3 using the presigned URL
          const fileResponse = await axios.get(downloadUrl, {
              responseType: 'blob', // Important to get the file as a blob
          });
          // get the upload date
          setLastModified(fileResponse.headers['last-modified']);
        } catch (error) {
            console.error('Error fetching presigned URLs or downloading file:', error);
        }
    };

    fetchPresignedUrls();
  }, [file_name, trip_id]);

  const handleClick = () => {
    console.log(fileUrl);
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
            // TODO: thumbnailUrl is not working properly, preview image isnt being displayed
            component="img"
            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
            image={thumbnailUrl || fileUrl || ''}
            alt={file_name}
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
        {fileUrl && file_name.endsWith('.pdf') && (
            <iframe
              src={fileUrl}
              width="100%"
              height="600"
              title="Document Preview"
            />
          )}
        {fileUrl && (file_name.endsWith('.jpg') || file_name.endsWith('.png') || file_name.endsWith('.jpeg')) && (
          <img
            src={fileUrl}
            alt={file_name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        )}
        {fileUrl && file_name.endsWith('.docx') && (
          <WordViewer fileUrl={fileUrl} />
        )}
        {fileUrl && (file_name.endsWith('.xlsx') || file_name.endsWith('.xls')) && (
          <ExcelViewer fileUrl={fileUrl} />
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