import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography, TextField, Button, Collapse, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel, RadioGroup, Radio, Fab } from '@mui/material';
import { useParams } from 'react-router-dom';
import { apiUrl, mapsKey } from 'src/config';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function LocationsView() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  
  const [categorizedData, setCategorizedData] = useState<{ [key: string]: any[] }>({ Unassigned: [] });
  const [newCategoryName, setNewCategoryName] = useState('');
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<any>(null);  // For storing selected place details
  const [openDialog, setOpenDialog] = useState(false);  // For controlling the place details dialog
  const [selectedPlaceName, setSelectedPlaceName] = useState('');  // For storing edited place name
  const [selectedPlaceCategory, setSelectedPlaceCategory] = useState('');  // For category selection
  const [isEditing, setIsEditing] = useState(false);  // Flag to indicate if we are editing an existing place
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const handleEditPlace = useCallback(
    (place: { name: string; lat: number; lng: number; place_id: string, category: string }) => {
      setSelectedPlaceDetails(place);
      setSelectedPlaceName(place.name);
      setSelectedPlaceCategory(!place.category ? 'Unassigned' : place.category); // Ensure selectedCategory is stable
      setIsEditing(true);
      setOpenDialog(true);
    },
    [] // Add dependencies here
  );

  const getLocations = useCallback(async () => {
    console.log("TRIGGERED ")
    try {
      const response = await fetch(`${apiUrl}/trip_locations/get-locations?trip_id=${trip_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('idToken')}`, // Assuming you're using a token for authorization
        },
      });

      if (response.ok) {

        const data = await response.json();
        const location_entries = data.locations;
        console.log(location_entries)

        if (map) {
          const newMarkers = location_entries.map((location: any) => {
            const marker = new google.maps.Marker({
              position: { lat: location.lat, lng: location.lng },
              map,
              title: location.name,
            });
            marker.addListener('click', () => {
              handleEditPlace({
                name: location.name,
                lat: location.lat,
                lng: location.lng,
                place_id: location.place_id,
                category: location.category,
              });
            });
            return marker;
          });

          markersRef.current = [...markersRef.current, ...newMarkers];
        }

        // Group locations by categories
        const groupedCategories: { [key: string]: any[] } = {};
        location_entries.forEach((location: any) => {
          const { category } = location;
          if (category) {
            if (!groupedCategories[category]) {
              groupedCategories[category] = [];
            }
            groupedCategories[category].push(location);
          }
          else {
            if (!groupedCategories.Unassigned) {
              groupedCategories.Unassigned = [];
            }
            groupedCategories.Unassigned.push(location);
          }
        });
        console.log(groupedCategories)

        setCategorizedData(groupedCategories);
      } else {
        console.error('Failed to fetch locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
    finally {
      setSelectedPlaceCategory(''); // Reset selected categories
    }
  }, [map, trip_id, handleEditPlace]);
  
  useEffect(() => {
    const loadScript = () => {
      if (!document.querySelector(`script[src="https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places"]`)) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        script.onerror = (error) => {
          console.error('Error loading Google Maps script', error);
        };
        document.head.appendChild(script);
      }
    };

    const initializeMap = () => {
      if (mapRef.current) {
        const googleMap = new google.maps.Map(mapRef.current, {
          center: { lat: 40.748817, lng: -73.985428 }, // Default to NYC
          zoom: 13,
          scrollwheel: true,  // Ensure scroll zoom is enabled
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
              id: place.place_id,
              name: place.name || 'Unnamed Location',
              lat: location.lat(),
              lng: location.lng(),
              place_id: place.place_id,  // Store the place_id to fetch detailed info
              category: '',
              category_id: '',
            };
            setSelectedPlaceName(newPlace.name);  // Set the name of the place to be added
            setSelectedPlaceCategory(''); // Reset selected categories

            // Show the dialog box
            setSelectedPlaceDetails(newPlace);
            setOpenDialog(true);
            setIsEditing(false);  // We are adding a new place, not editing
          }
        });

        googleMap.addListener('click', (e: google.maps.MapMouseEvent) => {
          const latLng = e.latLng;
          if (latLng) {
            const newPlace = {
              id: `new-${Math.random()}`, // Generate a unique id for this location
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

                setSelectedPlaceName(newPlace.name);  // Set the name of the place to be added
                setSelectedPlaceCategory(''); // Reset selected categories

                // Show the dialog box
                setSelectedPlaceDetails(newPlace);
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
      name: selectedPlaceName,
      lat: selectedPlaceDetails.lat,
      lng: selectedPlaceDetails.lng,
      place_id: selectedPlaceDetails.place_id,
      category: selectedPlaceCategory === 'Unassigned' ? null : selectedPlaceCategory,
    };
  
    console.log(newLocationData);
    if (!isEditing) {
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
          const responseData = await response.json();
          const newLocation = responseData.location;

          console.log('New location added:', newLocation);
    
          // Add marker to the map
          if (map && newLocation) {
            const marker = new google.maps.Marker({
              position: { lat: newLocation.latitude, lng: newLocation.longitude },
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
      finally {
        setSelectedPlaceCategory(''); // Reset selected categories
      }
    } else {
      // PUT request to update location in the backend
      try {
        const response = await fetch(`${apiUrl}/trip_locations/update-location`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('idToken')}`,  // Assuming you're using a token for authorization
          },
          body: JSON.stringify({ ...newLocationData, trip_id }),
        });
    
        if (response.ok) {
          console.log('Location updated successfully');
          getLocations();
          setOpenDialog(false);  // Close the dialog after successful update
        } else {
          const error = await response.json();
          setErrorMessage(error.message || 'Failed to update location');
        }
      } catch (error) {
        console.error('Error updating location:', error);
        setErrorMessage('An error occurred while updating the location. Please try again.');
      }
      finally {
        setSelectedPlaceCategory(''); // Reset selected categories
      }
    }
  };
  
  // i need a handleDeleteLocationEntry function which will delete the location entry from the backend and remove the marker from the map and update the categorizedData state
  const handleDeleteLocationEntry = async () => {
    if (!selectedPlaceDetails) {
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/trip_locations/delete-location`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('idToken')}`,  // Assuming you're using a token for authorization
        },
        body: JSON.stringify({ place_id: selectedPlaceDetails.place_id, trip_id }),
      });
  
      if (response.ok) {
        console.log('Location deleted successfully');
        // Remove the marker from the map
        console.log(markersRef.current)
        markersRef.current = markersRef.current.filter((marker) => {
          if (marker.getTitle() === selectedPlaceDetails.name) {
            marker.setMap(null);  // Remove the marker from the map
            return false;  // Filter out the marker
          }
          return true;
        });
  
        // Update categorizedData state
        const updatedCategories = { ...categorizedData };
        updatedCategories[selectedPlaceDetails.category] = updatedCategories[selectedPlaceDetails.category].filter((location: any) => location.place_id !== selectedPlaceDetails.place_id);
        setCategorizedData(updatedCategories);
  
        setOpenDialog(false);  // Close the dialog after successful deletion
      } else {
        const error = await response.json();
        setErrorMessage(error.message || 'Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      setErrorMessage('An error occurred while deleting the location. Please try again.');
    }
    finally {
      setSelectedPlaceCategory(''); // Reset selected categories
    }
  };

  const toggleCategoryExpanded = (category: string) => {
    setExpanded(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleAllExpanded = (expand: boolean) => {
    const newExpandedState = Object.keys(categorizedData).reduce((acc, category) => {
      acc[category] = expand;
      return acc;
    }, {} as { [key: string]: boolean });
    setExpanded(newExpandedState);
  };

  const handleCreateCategory = async () => {
    try {
      await fetch(`${apiUrl}/trip_locations/add-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('idToken')}`,  // Assuming you're using a token for authorization
        },
        body: JSON.stringify({category: newCategoryName, trip_id}),
      });
    } catch (error) {
      console.error('Error adding category:', error);
      setErrorMessage('An error occurred while adding the location. Please try again.');
    }
    getLocations();
    
  };

  const handleDeleteCategory = async (category: string) => {
    await fetch(`${apiUrl}/trip_locations/delete-category`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('idToken')}`,  // Assuming you're using a token for authorization
      },
      body: JSON.stringify({category, trip_id}),
    })
    .then(() => getLocations())
    .catch((error) => {
      console.error('Error deleting category:', error);
      setErrorMessage('An error occurred while deleting the category. Please try again.');
    });
    getLocations();
  };

  const handlePlaceEntryClick = (place: any) => {
    if (map) {
      map.setCenter({ lat: place.lat, lng: place.lng });
      map.setZoom(18);
    }
  }

  useEffect(() => {
    if (map) {
      getLocations();
    }
  }, [getLocations, map]);

  return (
    <>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#222831', color: '#EEEEEE', padding: 3, overflowY: 'auto' }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          Saved Locations
        </Typography>

        <TextField id="search-box" label="Search for places" fullWidth variant="outlined" sx={{ mb: 2 }} />

        <div ref={mapRef} style={{ width: '100%', height: '500px' }} />
        <br />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            label="New Category"
            variant="outlined"
            InputProps={{
              style: { color: '#EEEEEE' },
            }}
          />
          <Fab
            variant="extended"
            sx={{
              backgroundColor: '#00BFFF',
              '&:hover': { backgroundColor: '#005f8a' },
              color: 'white',
            }}
            onClick={handleCreateCategory}
          >
            <AddIcon sx={{ mr: 1 }} />
            Create Category
          </Fab>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#a3c1a1', // Darker pastel green color
              '&:hover': { backgroundColor: '#82a884' }, // Slightly darker pastel green color
              mr: 2,
            }}
            onClick={() => toggleAllExpanded(true)}
          >
            Expand All
          </Button>

          <Button
            variant="contained"
            color="secondary"
            sx={{
              backgroundColor: '#8aa6c1', // Darker pastel blue color
              '&:hover': { backgroundColor: '#6b8ba4' }, // Slightly darker pastel blue color
            }}
            onClick={() => toggleAllExpanded(false)}
          >
            Collapse All
          </Button>
        </Box>
        {Object.keys(categorizedData).map((category) => (
          <Box key={category} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="h6"
                sx={{ flexGrow: 1, cursor: 'pointer' }}
                onClick={() => toggleCategoryExpanded(category)}  // Add onClick for category name
              >
                {category}
              </Typography>
              {category !== 'Unassigned' && (
                <IconButton onClick={() => handleDeleteCategory(category)}>
                  <DeleteIcon sx={{ color: '#FF4F00' }} />
                </IconButton>
              )}
              <IconButton onClick={() => toggleCategoryExpanded(category)}>
                {expanded[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 2 }}>
              <Collapse in={expanded[category]}>
                {categorizedData[category].map((place: any) => (
                  <Box
                  key={place.place_id}
                  sx={{
                    mt: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#444851',
                    },
                  }}
                  onClick={() => handlePlaceEntryClick(place)}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 'bold',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {place.name}
                  </Typography>
                </Box>
                ))}
              </Collapse>
            </Box>
          </Box>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>{isEditing ? 'Edit Location' : 'Add Location'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Place Name"
          value={selectedPlaceName}
          onChange={(e) => setSelectedPlaceName(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{ mb: 2, marginTop: '10px' }}
        />
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        <div>
          <Typography variant='subtitle2'>Select Category</Typography>
          <RadioGroup
            value={selectedPlaceCategory === '' ? 'Unassigned' : selectedPlaceCategory}
            onChange={(event) => setSelectedPlaceCategory(event.target.value)}
          >
            {Object.keys(categorizedData).map((category) => (
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
