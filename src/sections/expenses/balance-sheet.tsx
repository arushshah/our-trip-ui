import { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, List, Card, CardContent, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Checkbox, FormControlLabel, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from 'src/context/AuthContext';
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

export function BalanceSheet() {
  const { trip_id = '' } = useParams<{ trip_id: string }>();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [tripUsers, setTripUsers] = useState<TripUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, number | undefined>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<ExpenseItem | null>(null);
  const [newExpense, setNewExpense] = useState({ title: '', amount: 0 });
  const [error, setError] = useState('');
  const userId = getAuth().currentUser?.uid;
  const { idToken } = useAuth();


  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/expenses/get-expenses?trip_id=${trip_id}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await response.json();
      setExpenses(data.expenses);
    } catch (e) {
      console.error('Error fetching expenses:', e);
    }
  }, [trip_id, idToken]);

  useEffect(() => {

    const fetchTripUsers = async () => {
      try {
        const response = await fetch(`${apiUrl}/trip_guests/get-trip-guests?trip_id=${trip_id}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await response.json();
        setTripUsers(data.guests);
      } catch (e) {
        console.error('Error fetching trip users:', e);
      }
    };
    fetchExpenses();
    fetchTripUsers();
  }, [trip_id, fetchExpenses, idToken]);


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
  
  const handleAddExpense = async () => {
    const totalUserAmount = Object.values(selectedUsers).reduce((acc: number, amount) => acc + (amount || 0), 0);
  
    if (totalUserAmount !== newExpense.amount) {
      setError('The total of selected user amounts must equal the total expense amount.');
      return;
    }
  
    const newExpenseItem: ExpenseItem = {
      expenseId: '',
      userId: userId || '',
      title: newExpense.title,
      amount: newExpense.amount,
      settled: false,
      createdDate: '',
    };
  
    const expenseData = {
      ...newExpenseItem,
      usersInvolved: Object.entries(selectedUsers).map(([selectedUserId, amount]) => ({
        selectedUserId,
        amount: amount || 0,
      })),
    };
  
    try {
      await fetch(`${apiUrl}/expenses/add-expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ ...expenseData, trip_id }),
      });
      setExpenses((prevExpenses) => [...prevExpenses, newExpenseItem]);
      setOpenDialog(false);
      fetchExpenses();
    } catch (e) {
      console.error('Error adding expense:', e);
    }
  };

  const handleUpdateExpense = async () => {
    const totalUserAmount = Object.values(selectedUsers).reduce((acc: number, amount) => acc + (amount || 0), 0);
  
    if (totalUserAmount !== newExpense.amount) {
      setError('The total of selected user amounts must equal the total expense amount.');
      return;
    }
  
    const expenseData = {
      expense_id: currentExpense?.expenseId,
      title: newExpense.title,
      trip_id,
      amount: newExpense.amount,
      usersInvolved: Object.entries(selectedUsers).map(([selectedUserId, amount]) => ({
        selectedUserId,
        amount: amount || 0,
      })),
    };
  
    try {
      await fetch(`${apiUrl}/expenses/update-expense`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(expenseData),
      });
      fetchExpenses();
      setOpenDialog(false);
    } catch (e) {
      console.error('Error updating expense:', e);
    }
  };
  

  const handleDeleteExpense = async () => {
    if (currentExpense) {
      try {
        await fetch(`${apiUrl}/expenses/delete-expense`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ expense_id: currentExpense?.expenseId, trip_id }),
        });
        setExpenses((prev) => prev.filter((exp) => exp.expenseId !== currentExpense.expenseId));
        setOpenDialog(false);
      } catch (e) {
        console.error('Error deleting expense:', e);
      }
    }
  };

  const handleUserSelection = (selectedUserId: string, checked: boolean) => {
    setSelectedUsers((prev) => ({ ...prev, [selectedUserId]: checked ? 0 : undefined }));
  };

  const handleAmountChange = (selectedUserId: string, amount: number) => {
    setSelectedUsers((prev) => ({ ...prev, [selectedUserId]: amount }));
  };

  const formatDollarValue = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <>
        <List>
          {expenses.map((expense) => (
            <Card key={expense.expenseId} onClick={() => handleOpenDialog(expense)} sx={{ mb: 2, cursor: 'pointer', opacity: .8 }}>
              <CardContent>
                <Typography variant="h6">{expense.title}</Typography>
                <Typography variant="body2">Amount: {formatDollarValue(expense.amount)}</Typography>
                <Typography variant="body2">Paid By: {expense.userFirstName} {expense.userLastName}</Typography>
              </CardContent>
            </Card>
          ))}
        </List>

        <Button variant="contained" onClick={() => handleOpenDialog()} sx={{ mt: 2, backgroundColor: '#20C997', '&:hover': { backgroundColor: '#17A589' } }}>Add Expense</Button>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{currentExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Title" fullWidth value={newExpense.title} onChange={(e) => setNewExpense((prev) => ({ ...prev, title: e.target.value }))} />
            <TextField
              margin="dense"
              label="Amount"
              type="number"
              fullWidth
              value={newExpense.amount}
              onChange={(e) => setNewExpense((prev) => ({ ...prev, amount: parseFloat(e.target.value) }))}
              InputProps={{ startAdornment: <span>$</span> }}
            />
            <Typography variant="h6" sx={{ mt: 2 }}>Include Users in Expense</Typography>
            {tripUsers.map((user) => (
              <Box key={user.guest_username} display="flex" alignItems="center">
                <FormControlLabel control={<Checkbox checked={selectedUsers[user.guest_username] !== undefined} onChange={(e) => handleUserSelection(user.guest_username, e.target.checked)} />} label={`${user.guest_first_name} ${user.guest_last_name}`} />
                {selectedUsers[user.guest_username] !== undefined && (
                  <TextField
                    margin="dense"
                    label="Amount Owed"
                    type="number"
                    value={selectedUsers[user.guest_username] || ''}
                    onChange={(e) => handleAmountChange(user.guest_username, parseFloat(e.target.value))}
                    InputProps={{ startAdornment: <span>$</span> }}
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
            ))}
            {error && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={currentExpense ? handleUpdateExpense : handleAddExpense} color="primary">
                {currentExpense ? 'Update' : 'Add'}
            </Button>
            {currentExpense && (
                <IconButton onClick={handleDeleteExpense} color="error" title="Delete Expense">
                <DeleteIcon />
                </IconButton>
            )}
            </DialogActions>
        </Dialog>
    </>
  );
}
