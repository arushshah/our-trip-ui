import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { mapsKey } from 'src/config';

export default function LocationsView() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  const [places, setPlaces] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  // Dynamically load the Google Maps script
  useEffect(() => {
    const loadScript = () => {
      // Check if the script is already loaded
      if (document.querySelector(`script[src="https://maps.googleapis.com/maps/api/js?key=${mapsKey}}&libraries=places"]`)) {
        return; // If already loaded, skip appending
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initializeMap();
      document.head.appendChild(script);
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
        
        // Set the autocomplete instance
        setAutocomplete(autoComplete);

        // Map click listener to save locations
        googleMap.addListener('click', (e: google.maps.MapMouseEvent) => {
          const latLng = e.latLng;
          if (latLng) {
            const newPlace = {
              name: 'New Location',
              lat: latLng.lat(),
              lng: latLng.lng(),
            };
            setPlaces((prev) => [...prev, newPlace]);
          }
        });

        // Set the map reference
        setMap(googleMap);
      }
    };

    loadScript(); // Dynamically load the Google Maps script

    return () => {
      // Cleanup the script when the component unmounts
      const scripts = document.querySelectorAll(`script[src^="https://maps.googleapis.com"]`);
      scripts.forEach((script) => script.remove());
    };
  }, []);

  // Handle place search selection
  const handlePlaceSelect = () => {
    if (autocomplete && map) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const { lat, lng } = place.geometry.location;
        const newPlace = {
          name: place.name || 'Unnamed Location',
          lat: lat(),
          lng: lng(),
        };
        setPlaces((prev) => [...prev, newPlace]);

        // Optionally, move the map to the selected location
        map.setCenter(new google.maps.LatLng(lat(), lng()));
        map.setZoom(15);
      }
    }
  };

  return (
    <>
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
          sx={{ mb: 2 }}
          InputProps={{
            style: {
              color: '#EEEEEE', // Set the text color to white
            },
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handlePlaceSelect();
            }
          }}
        />
        <Button
          variant="contained"
          sx={{ mb: 3 }}
          onClick={handlePlaceSelect}
        >
          Add Selected Place
        </Button>

        {/* Google Map */}
        <div
          ref={mapRef}
          style={{ width: '100%', height: '400px' }}
        />

        <Typography variant="h6" sx={{ mt: 3 }}>
          Saved Locations:
        </Typography>
        <ul>
          {places.map((place, index) => (
            <li key={index}>{place.name}</li>
          ))}
        </ul>
      </Box>
    </>
  );
}
