import { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, List, Card, CardContent, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Checkbox, FormControlLabel, IconButton
} from '@mui/material';
import {apiUrl} from 'src/config';
import { useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

interface ExpenseItem {
  expenseId: string;
  userId: string;
  title: string;
  amount: number;
  settled: boolean;
  createdDate: string;
  userFirstName?: string;
  userLastName?: string;
  usersInvolved?: { selectedUserId: string; amount: number, firstName: string, lastName: string }[];
}

interface TripUser {
  guest_username: string;
  guest_first_name: string;
  guest_last_name: string;
  is_host: boolean;
  rsvp_status: string;
}

export function SummaryView() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [tripUsers, setTripUsers] = useState<TripUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, number | undefined>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<ExpenseItem | null>(null);
  const [newExpense, setNewExpense] = useState({ title: '', amount: 0 });
  const [error, setError] = useState('');
  const userId = getAuth().currentUser?.uid;
  const [usersSpentAmounts, setUsersSpentAmounts] = useState<Record<string, number>>({});
  const [usersOweAmounts, setUsersOweAmounts] = useState<{ [key: string]: { [key: string]: number } }>({});

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/expenses/get-expenses?trip_id=${trip_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('idToken')}` },
      });
      const data = await response.json();
      setExpenses(data.expenses);
    } catch (e) {
      console.error('Error fetching expenses:', e);
    }
  }, [trip_id]);

  useEffect(() => {

    const fetchTripUsers = async () => {
      try {
        const response = await fetch(`${apiUrl}/trip_guests/get-trip-guests?trip_id=${trip_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('idToken')}` },
        });
        const data = await response.json();
        setTripUsers(data.guests);
      } catch (e) {
        console.error('Error fetching trip users:', e);
      }
    };
    fetchExpenses();
    fetchTripUsers();
    
    // mapping the userid to how much they spent
    const spentAmounts: Record<string, number> = expenses.reduce((acc: Record<string, number>, ex: ExpenseItem) => {
        acc[ex.userId] = (acc[ex.userId] || 0) + ex.amount;
        return acc;
    }, {});

    setUsersSpentAmounts(spentAmounts);

    // mapping the userid to how much they owe each user. i dont want to include the user that spent the money in the list of users they owe
    const oweAmounts: Record<string, Record<string, number>> = expenses.reduce((acc: Record<string, Record<string, number>>, ex: ExpenseItem) => {
        ex.usersInvolved?.forEach((user) => {
            if (user.selectedUserId !== ex.userId) {
                acc[user.selectedUserId] = acc[user.selectedUserId] || {};
                acc[user.selectedUserId][ex.userId] = (acc[user.selectedUserId][ex.userId] || 0) + user.amount;
            }
        });
        return acc;
    }, {});

    setUsersOweAmounts(oweAmounts);
    
  }, [trip_id, fetchExpenses, expenses]);

  const handleOpenDialog = (expense?: ExpenseItem) => {
    setCurrentExpense(expense || null);
    setNewExpense(expense ? { title: expense.title, amount: expense.amount } : { title: '', amount: 0 });
  
    // Pre-fill `selectedUsers` with the users involved in this expense
    if (expense?.usersInvolved) {
      const initialSelectedUsers = expense.usersInvolved.reduce((acc, user) => {
        acc[user.selectedUserId] = user.amount;
        return acc;
      }, {} as Record<string, number>);
      setSelectedUsers(initialSelectedUsers);
    } else {
      setSelectedUsers({});
    }
    setError('');
    setOpenDialog(true);
  };


  const handleUserSelection = (selectedUserId: string, checked: boolean) => {
    setSelectedUsers((prev) => ({ ...prev, [selectedUserId]: checked ? 0 : undefined }));
  };

  const formatDollarValue = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <>
        <List>
        {
            Object.keys(usersSpentAmounts).map((userId1) =>
                <Typography key={userId1}>{tripUsers.find(user => user.guest_username === userId1)?.guest_first_name} {tripUsers.find(user => user.guest_username === userId1)?.guest_last_name} spent ${usersSpentAmounts[userId1] || 0}</Typography>)
        }
        {
            Object.keys(usersOweAmounts).map((userId2) =>
                <Typography key={userId2}>
                    {tripUsers.find(user => user.guest_username === userId2)?.guest_first_name} {tripUsers.find(user => user.guest_username === userId2)?.guest_last_name} owes {Object.keys(usersOweAmounts[userId2]).map((oweUserId) => `${tripUsers.find(user => user.guest_username === oweUserId)?.guest_first_name} ${tripUsers.find(user => user.guest_username === oweUserId)?.guest_last_name} $${usersOweAmounts[userId2][oweUserId]}`).join(', ')}</Typography>)
        }
        </List>
        <Button variant="contained" onClick={() => handleOpenDialog()} sx={{ mt: 2, backgroundColor: '#20C997', '&:hover': { backgroundColor: '#17A589' } }}>Add Expense</Button>
    </>
  );
}
