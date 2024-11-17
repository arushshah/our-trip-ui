import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, TextField, Collapse, IconButton } from '@mui/material';
import { apiUrl } from 'src/config';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';

export function ViewItinerary() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();

  const [tripStartDate, setTripStartDate] = useState<string>('');
  const [tripEndDate, setTripEndDate] = useState<string>('');
  const [itinerary, setItinerary] = useState<Record<string, string[]>>({});
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();

        const response = await fetch(`${apiUrl}/trips/get-trip?trip_id=${trip_id}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const data = await response.json();
        setTripStartDate(data.trip_details.trip_start_date);
        setTripEndDate(data.trip_details.trip_end_date);

        const start = dayjs(data.trip_details.trip_start_date);
        const end = dayjs(data.trip_details.trip_end_date);
        const tempItinerary: Record<string, string[]> = {};
        const tempExpandedDates: Record<string, boolean> = {};
        for (let date = start; date <= end; date = date.add(1, 'day')) {
          const formattedDate = date.format('YYYY-MM-DD');
          tempItinerary[formattedDate] = [];
          tempExpandedDates[formattedDate] = true;
        }
        setItinerary(tempItinerary);
        setExpandedDates(tempExpandedDates);

      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };

    fetchTripDetails();
  }, [trip_id]);

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const addEntry = (date: string, entry: string) => {
    setItinerary((prev) => ({
      ...prev,
      [date]: [...prev[date], entry],
    }));
  };

  const deleteEntry = (date: string, index: number) => {
    setItinerary((prev) => ({
      ...prev,
      [date]: prev[date].filter((_, i) => i !== index),
    }));
  };

  const editEntry = (date: string, index: number, newEntry: string) => {
    setItinerary((prev) => ({
      ...prev,
      [date]: prev[date].map((entry, i) => (i === index ? newEntry : entry)),
    }));
  };

  const expandAll = () => {
    setExpandedDates((prev) =>
      Object.keys(prev).reduce((acc, date) => ({ ...acc, [date]: true }), {})
    );
  };

  const collapseAll = () => {
    setExpandedDates((prev) =>
      Object.keys(prev).reduce((acc, date) => ({ ...acc, [date]: false }), {})
    );
  };

  return (
    <Box sx={{ p: 3, color: 'white' }}>
      <Typography variant="h2" sx={{ mb: 2 }}>
        Here is your itinerary
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={expandAll}>
          Expand All
        </Button>
        <Button variant="outlined" onClick={collapseAll}>
          Collapse All
        </Button>
      </Box>

      {Object.keys(itinerary).map((date) => (
        <Box key={date} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleExpand(date)}>
            <Typography variant="h4" sx={{ mr: 1 }}>
              {dayjs(date).format('dddd, MMMM D, YYYY')}
            </Typography>
            <IconButton>
              {expandedDates[date] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={expandedDates[date]}>
            <Box sx={{ mt: 2 }}>
              {itinerary[date].map((entry, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                    pl: 3, // Indent entries
                  }}
                >
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    •
                  </Typography>
                  <TextField
                    variant="standard"
                    value={entry}
                    onChange={(e) => editEntry(date, index, e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                      style: { color: 'white' },
                    }}
                  />
                  <IconButton onClick={() => deleteEntry(date, index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <AddEntryForm date={date} onAdd={addEntry} />
            </Box>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
}

function AddEntryForm({ date, onAdd }: { date: string; onAdd: (date: string, entry: string) => void }) {
  const [entry, setEntry] = useState('');

  const handleAdd = () => {
    if (entry.trim()) {
      onAdd(date, entry);
      setEntry('');
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        label="Add an activity"
        variant="outlined"
        size="small"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        InputProps={{
          style: { color: '#eeeeee' },
        }}
      />
      <Button variant="contained" onClick={handleAdd}>
        Add
      </Button>
    </Box>
  );
}
