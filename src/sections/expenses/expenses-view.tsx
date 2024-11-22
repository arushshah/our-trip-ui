import { useState } from 'react';
import {
  Box, Typography
} from '@mui/material';
import ExpensesNavbar from './expenses-navbar';
import { BalanceSheet } from './balance-sheet';
import { SummaryView } from './summary-view';

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

export function ExpensesView() {

  const [activeTab, setActiveTab] = useState<string>('summary');
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Box sx={{ padding: 3, backgroundColor: '#222831', color: '#EEEEEE', minHeight: '100vh' }}>
        <Typography variant="h2" sx={{ mb: 2 }}>Trip Expenses</Typography>
        <ExpensesNavbar activeTab={activeTab} handleChange={handleTabChange} />

        {activeTab === 'summary' ? 
          <SummaryView /> : <BalanceSheet />
        }
      </Box>
    </>
  );
}
