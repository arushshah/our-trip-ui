import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import { mapsKey } from 'src/config';

export default function LocationsView() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  const [places, setPlaces] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

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
            };
            setPlaces((prev) => [...prev, newPlace]);

            const marker = new google.maps.Marker({
              position: location,
              map: googleMap,
            });
            markersRef.current.push(marker);
          }
        });

        googleMap.addListener('click', (e: google.maps.MapMouseEvent) => {
          const latLng = e.latLng;
          if (latLng) {
            const newPlace = {
              name: 'New Location',
              lat: latLng.lat(),
              lng: latLng.lng(),
            };
            setPlaces((prev) => [...prev, newPlace]);

            const marker = new google.maps.Marker({
              position: latLng,
              map: googleMap,
            });
            markersRef.current.push(marker);
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

  // Handle clicking on a saved location to center it on the map
  const handleLocationClick = (place: { lat: number, lng: number }) => {
    if (map) {
      const latLng = new google.maps.LatLng(place.lat, place.lng);
      map.setCenter(latLng);
      map.setZoom(15);

      const marker = new google.maps.Marker({
        position: latLng,
        map,
      });
      markersRef.current.push(marker);
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
        />

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
                <li key={index} style={{ listStyle: 'none', marginBottom: '8px' }}>
                <button
                    type="button"  // Add this type attribute
                    onClick={() => handleLocationClick(place)}
                    style={{
                    background: 'none',
                    border: 'none',
                    color: '#EEEEEE',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 'inherit',
                    padding: 0,
                    }}
                >
                    {place.name}
                </button>
                </li>
            ))}
        </ul>

      </Box>
    </>
  );
}
