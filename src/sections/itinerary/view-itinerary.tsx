import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, TextField, Collapse, IconButton } from '@mui/material';
import { apiUrl } from 'src/config';
import { getAuth } from 'firebase/auth';
import dayjs from 'dayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';

export function ViewItinerary() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();

  const [itinerary, setItinerary] = useState<Record<string, {id: string; description: string}[]>>({});
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCurrentItinerary = async () => {
      try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();

        const response = await fetch(`${apiUrl}/trip_itinerary/get-itinerary?trip_id=${trip_id}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const data = await response.json();
        console.log(data);

        const tempItinerary: Record<string, {id: string; description: string}[]> = {};
        const tempExpandedDates: Record<string, boolean> = {};

        data.itinerary.forEach((entry: { date: string; description: string, id: string }) => {
            tempExpandedDates[entry.date] = true;
            if (!tempItinerary[entry.date]) {
                tempItinerary[entry.date] = [];
            }
            if (entry.description.trim().length > 0) {
                tempItinerary[entry.date].push({id: entry.id, description: entry.description});
            }
            });

        setItinerary(tempItinerary);
        setExpandedDates(tempExpandedDates);

      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };

    fetchCurrentItinerary();
  }, [trip_id]);

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const addEntry = async (date: string, entry: string) => {
    const newEntry = { id: uuidv4(), description: entry };
    setItinerary((prev) => ({
      ...prev,
      [date]: [...prev[date], newEntry],
    }));
    try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
    
        const response = await fetch(`${apiUrl}/trip_itinerary/add-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                trip_id,
                date,
                description: entry,
                item_id: newEntry.id,
            }),
        });
    
        if (!response.ok) {
            throw new Error('Failed to add entry');
        }
        } catch (error) {
        console.error('Error adding entry:', error)
    }
  };

  const deleteEntry = async (date: string, index: number) => {
    setItinerary((prev) => ({
      ...prev,
      [date]: prev[date].filter((_, i) => i !== index),
    }));
    try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
    
        const response = await fetch(`${apiUrl}/trip_itinerary/delete-item`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                trip_id,
                date,
                index,
            }),
        });
    
        if (!response.ok) {
            throw new Error('Failed to delete entry');
        }
        }
        catch (error) {
        console.error('Error deleting entry:', error);
    }
  };

  const editEntry = (date: string, index: number, newEntry: string) => {
    setItinerary((prev) => ({
      ...prev,
      [date]: prev[date].map((entry, i) => (i === index ? { ...entry, description: newEntry } : entry)),
    }));
  };

  const editConfirmation = async (date: string, description: string, id: string) => {
    try {
        const auth = getAuth();
        const idToken = await auth.currentUser?.getIdToken();
    
        const response = await fetch(`${apiUrl}/trip_itinerary/update-item`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                trip_id,
                date,
                description,
                item_id: id,
            }),
        });
    
        if (!response.ok) {
            throw new Error('Failed to update entry');
        }
        } catch (error) {
        console.error('Error updating entry:', error)
    }
  }

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
                    value={entry.description}
                    onChange={(e) => editEntry(date, index, e.target.value)}
                    onBlur={() => editConfirmation(date, entry.description, entry.id)}
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
    const maxLength = 500;
  
    const handleAdd = () => {
      if (entry.trim()) {
        onAdd(date, entry);
        setEntry('');
      }
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.length <= maxLength) {
        setEntry(e.target.value);
      }
    };
  
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="Add an activity"
          variant="outlined"
          size="small"
          value={entry}
          onChange={handleChange}
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