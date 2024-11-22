import { useCallback, useEffect, useState } from 'react';
import {
  Box, Typography, List, Card, CardContent, Grid, Avatar
} from '@mui/material';
import { apiUrl } from 'src/config';
import { useParams } from 'react-router-dom';

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
  const [usersSpentAmounts, setUsersSpentAmounts] = useState<Record<string, number>>({});
  const [usersOweAmounts, setUsersOweAmounts] = useState<{ [key: string]: { [key: string]: number } }>({});
  const formatUserName = (user: TripUser) => `${user?.guest_first_name} ${user?.guest_last_name}`;
  const displayAmount = (amount: number) => `$${amount.toFixed(2)}`;

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

  const fetchTripUsers = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/trip_guests/get-trip-guests?trip_id=${trip_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('idToken')}` },
      });
      const data = await response.json();
      setTripUsers(data.guests);
    } catch (e) {
      console.error('Error fetching trip users:', e);
    }
  }, [trip_id]);

  useEffect(() => {
    fetchExpenses();
    fetchTripUsers();
  }, [fetchExpenses, fetchTripUsers]);

  useEffect(() => {
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
  }, [expenses]);

  return (
    <List>
      {/* Users who have spent money */}
      {Object.keys(usersSpentAmounts).map((userId1) => {
        const user = tripUsers.find(us => us.guest_username === userId1);
        return (
          <Card key={userId1} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar>{user?.guest_first_name[0]}</Avatar> {/* User avatar */}
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">{user ? formatUserName(user) : 'Unknown User'}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    lent {displayAmount(usersSpentAmounts[userId1])}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}

      {/* Users who owe money */}
      {Object.keys(usersOweAmounts).map((userId2) => {
        const user = tripUsers.find(us => us.guest_username === userId2);
        return (
          <Card key={userId2} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar>{user?.guest_first_name[0]}</Avatar> {/* User avatar */}
                </Grid>
                <Grid item xs>
                  <Typography variant="h6">{user ? formatUserName(user) : 'Unknown User'}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    borrowed from:
                  </Typography>
                  {Object.keys(usersOweAmounts[userId2]).map((oweUserId, index) => {
                    const oweUser = tripUsers.find(us => us.guest_username === oweUserId);
                    return (
                      <Typography key={oweUserId} variant="body2" color="textSecondary">
                        {oweUser ? `${formatUserName(oweUser)} ${displayAmount(usersOweAmounts[userId2][oweUserId])}` : 'Unknown User'}
                      </Typography>
                    );
                  })}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
    </List>
  );
}