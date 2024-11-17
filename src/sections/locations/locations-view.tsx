import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, TextField, Button, Collapse, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel, RadioGroup, Radio } from '@mui/material';
import { useParams } from 'react-router-dom';
import { apiUrl, mapsKey } from 'src/config';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';

export default function LocationsView() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [categories, setCategories] = useState<{ [key: string]: any[] }>({ All: [] });
  const [newCategoryName, setNewCategoryName] = useState('');
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);  // For storing selected place details
  const [openDialog, setOpenDialog] = useState(false);  // For controlling the place details dialog
  const [placeName, setPlaceName] = useState('');  // For storing edited place name
  const [selectedCategory, setSelectedCategory] = useState('');  // For category selection
  const [isEditing, setIsEditing] = useState(false);  // Flag to indicate if we are editing an existing place
  const [errorMessage, setErrorMessage] = useState<string>('');


  useEffect(() => {
    const loadScript = () => {
      if (!document.querySelector(`script[src="https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places"]`)) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      }
    };

    const initializeMap = () => {
      if (mapRef.current) {
        const googleMap = new google.maps.Map(mapRef.current, {
          center: { lat: 40.748817, lng: -73.985428 }, // Default to NYC
          zoom: 13,
        });

        const input = document.getElementById('search-box') as HTMLInputElement;
        const autoComplete = new google.maps.places.Autocomplete(input);
        autoComplete.setFields(['place_id', 'geometry', 'name']);
        
        setAutocomplete(autoComplete);
        setMap(googleMap);

        autoComplete.addListener('place_changed', () => {
          const place = autoComplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const location = place.geometry.location;
            googleMap.setCenter(location);
            googleMap.setZoom(15);

            const newPlace = {
              name: place.name || 'Unnamed Location',
              lat: location.lat(),
              lng: location.lng(),
              place_id: place.place_id,  // Store the place_id to fetch detailed info
            };
            setPlaceName(newPlace.name);  // Set the name of the place to be added
            setSelectedCategory(''); // Reset selected categories

            // Show the dialog box
            setSelectedPlace(newPlace);
            setOpenDialog(true);
            setIsEditing(false);  // We are adding a new place, not editing
          }
        });

        googleMap.addListener('click', (e: google.maps.MapMouseEvent) => {
          const latLng = e.latLng;
          if (latLng) {
            const newPlace = {
              name: 'New Location',
              lat: latLng.lat(),
              lng: latLng.lng(),
              place_id: '', // Initialize with empty place_id
            };

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: latLng }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                const place = results[0];
                newPlace.place_id = place.place_id; // Assign the place_id

                setPlaceName(newPlace.name);  // Set the name of the place to be added
                setSelectedCategory(''); // Reset selected categories

                // Show the dialog box
                setSelectedPlace(newPlace);
                setOpenDialog(true);
                setIsEditing(false);  // We are adding a new place, not editing
              } else {
                console.error('Geocoder failed due to: ', status);
                alert('Could not fetch location details. Please try again.');
              }
            });
          }
        });
      }
    };

    loadScript();

    return () => {
      const scripts = document.querySelectorAll(`script[src^="https://maps.googleapis.com"]`);
      scripts.forEach((script) => script.remove());
    };
  }, []);

  const handleLocationConfirmation = async () => {
  
    const newLocationData = {
      name: placeName,
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
      place_id: selectedPlace.place_id,
      category: selectedCategory,
    };
  
    console.log(newLocationData);
    // POST request to add location to the backend
    try {
      const response = await fetch(`${apiUrl}/trip_locations/add-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('idToken')}`,  // Assuming you're using a token for authorization
        },
        body: JSON.stringify({...newLocationData, trip_id}),
      });
  
      if (response.ok) {
        // Assuming the response includes the new location with its ID
        const newLocation = await response.json();
        
        // Update local state with the new location
        const updatedCategories = { ...categories };
        newLocation.categories.forEach((category: string) => {
          if (!updatedCategories[category]) updatedCategories[category] = [];
          updatedCategories[category].push(newLocation);
        });
  
        setCategories(updatedCategories);
  
        // Add marker to the map
        if (map && newLocation) {
          const marker = new google.maps.Marker({
            position: { lat: newLocation.lat, lng: newLocation.lng },
            map,
            title: newLocation.name,
          });
  
          markersRef.current.push(marker);
        }
  
        setOpenDialog(false);  // Close the dialog after successful addition
      } else {
        const error = await response.json();
        setErrorMessage(error.message || 'Failed to add location');
      }
    } catch (error) {
      console.error('Error adding location:', error);
      setErrorMessage('An error occurred while adding the location. Please try again.');
    }
  };
  
  const handleDeleteLocationEntry = () => {
    // Ensure the selected place is available
    if (selectedPlace) {
      // Remove the selected place from its category
      setCategories(prevCategories => {
        const updatedCategories = { ...prevCategories };
  
        // Remove the place from all categories (or the specific category)
        Object.keys(updatedCategories).forEach(category => {
          updatedCategories[category] = updatedCategories[category].filter(
            (place: any) => place.place_id !== selectedPlace.place_id
          );
        });
  
        // Remove the marker from the map
        markersRef.current = markersRef.current.filter(marker => {
          if (marker.getPosition()?.lat() === selectedPlace.lat && marker.getPosition()?.lng() === selectedPlace.lng) {
            marker.setMap(null);
            return false;
          }
          return true;
        });
  
        return updatedCategories;
      });
  
      // Close the dialog after deletion
      setOpenDialog(false);
      setIsEditing(false); // Reset editing flag
    }
  };

  const handleEditPlace = (place: { name: string, lat: number, lng: number, place_id: string }) => {
    setSelectedPlace(place);
    setPlaceName(place.name);
    setSelectedCategory(selectedCategory);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const toggleCategoryExpanded = (category: string) => {
    setExpanded(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleAllExpanded = (expand: boolean) => {
    const newExpandedState = Object.keys(categories).reduce((acc, category) => {
      acc[category] = expand;
      return acc;
    }, {} as { [key: string]: boolean });
    setExpanded(newExpandedState);
  };

  const handleDeleteCategory = (category: string) => {
    const updatedCategories = { ...categories };
    delete updatedCategories[category];  // Delete the category
    setCategories(updatedCategories);
  };

  return (
    <>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#222831', color: '#EEEEEE', padding: 3, overflowY: 'auto' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Saved Locations
        </Typography>

        <TextField id="search-box" label="Search for places" fullWidth variant="outlined" sx={{ mb: 2 }} />

        <div ref={mapRef} style={{ width: '100%', height: '400px' }} />

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            label="New Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            variant="outlined"
            sx={{ marginRight: 2 }}
          />
          <Button
            variant="contained"
            sx={{ backgroundColor: '#ee6c4d', '&:hover': { backgroundColor: '#f7b7a3' } }}
            onClick={() => setCategories((prev) => ({ ...prev, [newCategoryName]: [] }))}
          >
            Add Category
          </Button>
        </Box>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={() => toggleAllExpanded(true)}
        >
          Expand All
        </Button>

        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 2, ml: 2 }}
          onClick={() => toggleAllExpanded(false)}
        >
          Collapse All
        </Button>

        {Object.keys(categories).map((category) => (
          <Box key={category} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h6"
                sx={{ flexGrow: 1, cursor: 'pointer' }}
                onClick={() => toggleCategoryExpanded(category)}  // Add onClick for category name
              >
                {category}
              </Typography>
              {category !== 'All' && (
                <IconButton onClick={() => handleDeleteCategory(category)}>
                  <DeleteIcon sx={{ color: '#FF4F00' }} />
                </IconButton>
              )}
              <IconButton onClick={() => toggleCategoryExpanded(category)}>
                {expanded[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expanded[category]}>
              {categories[category].map((place: any) => (
                <Box
                  key={place.place_id}
                  sx={{
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#444851',
                    },
                  }}
                  onClick={() => handleEditPlace(place)}
                >
                  <Typography>{place.name}</Typography>
                </Box>
              ))}
            </Collapse>
          </Box>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>{isEditing ? 'Edit Location' : 'Add Location'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Place Name"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{ mb: 2, marginTop: '10px' }}
        />
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        <div>
          <RadioGroup
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            {Object.keys(categories).map((category) => (
              <FormControlLabel
                key={category}
                value={category}
                control={<Radio />}
                label={category}
              />
            ))}
          </RadioGroup>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleLocationConfirmation} color="primary">
          {isEditing ? 'Save Changes' : 'Add Location'}
        </Button>

        {isEditing && (
          <Button onClick={handleDeleteLocationEntry} color="error">
            Delete Location
          </Button>
        )}
      </DialogActions>
    </Dialog>
    </>
  );
}
