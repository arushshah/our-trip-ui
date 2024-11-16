import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, TextField, Card, CardContent, IconButton, CardActions } from '@mui/material';
import { useParams } from 'react-router-dom';
import { apiUrl, mapsKey } from 'src/config';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';
import ViewTripViewNavbar from '../trip/view/view-trip-view-navbar';

export default function LocationsView() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  const [places, setPlaces] = useState<any[]>([]); // List of saved places
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map()); // To store markers by place id

  // Make a backend call to save a location of the trip
  const saveLocation = async (place: any) => {
    try {
      const response = await fetch(`${apiUrl}/locations/add-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location_id: uuidv4(), latitude: place.lat, longitude: place.lng, trip_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      const data = await response.json();
      console.log('Saved location:', data);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to delete a location from the trip
  const deleteLocation = async (place: any) => {
    try {
      const response = await fetch(`${apiUrl}/locations/delete-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude: place.lat, longitude: place.lng, trip_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete location');
      }

      const data = await response.json();
      console.log('Deleted location:', data);
    } catch (error) {
      console.error(error);
    }
  };

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
            };
            setPlaces((prev) => [...prev, newPlace]);

            const marker = new google.maps.Marker({
              position: location,
              map: googleMap,
            });

            // Store marker by place id to easily remove later
            if (newPlace.id) {
              markersRef.current.set(newPlace.id, marker);
            }
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
            };
            setPlaces((prev) => [...prev, newPlace]);

            const marker = new google.maps.Marker({
              position: latLng,
              map: googleMap,
            });

            markersRef.current.set(newPlace.id, marker);
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

  // Function to handle delete button click and remove the marker
  const handleDeleteLocation = (id: string, event: React.MouseEvent) => {
    // Stop event propagation to avoid triggering the map centering
    event.stopPropagation();
  
    // Remove the place from state (this will remove it from the list of places)
    setPlaces((prevPlaces) => prevPlaces.filter((place) => place.id !== id));
  
    // Remove the corresponding marker from the map
    const marker = markersRef.current.get(id);
    if (marker) {
      marker.setMap(null); // Remove the marker from the map
      markersRef.current.delete(id); // Remove from markers map
    }
  };
  

  // Function to handle location card click to center the map
  const handleLocationClick = (place: { id: string; lat: number; lng: number }) => {
    if (map) {
      const latLng = new google.maps.LatLng(place.lat, place.lng);
      map.setCenter(latLng);
      map.setZoom(15); // Optional: Set zoom level when selecting a location

      // Optional: Update the map with a marker when a card is clicked
      const marker = new google.maps.Marker({
        position: latLng,
        map,
      });
      markersRef.current.set(place.id, marker);
    }
  };

  return (
    <>
      <ViewTripViewNavbar trip_id={trip_id || ''} />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#222831',
          color: '#EEEEEE',
          padding: 3,
          overflowY: 'auto',
        }}
      >
        <Typography variant="h3" sx={{ mb: 2 }}>
          Saved Locations
        </Typography>

        <TextField
          id="search-box"
          label="Search for places"
          fullWidth
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiInputBase-root': {
              color: '#EEEEEE', // Text color inside the input
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#EEEEEE', // Border color
              },
              '&:hover fieldset': {
                borderColor: '#EEEEEE', // Hover border color
              },
              '&.Mui-focused fieldset': {
                borderColor: '#EEEEEE', // Focused border color
              },
            },
          }}
        />

        {/* Google Map */}
        <div
          ref={mapRef}
          style={{ width: '100%', height: '400px' }}
        />

        <Typography variant="h6" sx={{ mt: 3 }}>
          Saved Locations:
        </Typography>

        {/* Render each saved place as a card with a delete button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {places.map((place) => (
            <Card
              key={place.id}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => handleLocationClick(place)} // Handle card click to center the map
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ color: '#EEEEEE' }}>
                  {place.name}
                </Typography>
              </CardContent>
              <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  color="secondary"
                  onClick={(event) => handleDeleteLocation(place.id, event)} // Pass the event to stop propagation
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>

      </Box>
    </>
  );
}
