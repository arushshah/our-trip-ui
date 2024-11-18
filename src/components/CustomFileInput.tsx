import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function CustomFileInput() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
      <Button
        variant="contained"
        component="label"
        sx={{
          backgroundColor: 'white',
          color: 'black',
          padding: '10px 20px',
          fontSize: '1.1rem',
          textTransform: 'none',
          border: '1px solid black',
          '&:hover': {
            backgroundColor: 'black',
            color: 'white',
          },
        }}
      >
        Choose File
        <input
          type="file"
          hidden
          onChange={handleFileChange}
          
        />
      </Button>
      
        <Typography variant="body1" sx={{ color: 'white' }}>
            Selected File: {selectedFile ? selectedFile.name :'None'}
        </Typography>

    </Box>
  );
}
