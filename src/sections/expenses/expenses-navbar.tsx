import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

interface ExpensesNavbarProps {
    activeTab: string;
    handleChange: (event: React.SyntheticEvent, newValue: string) => void;
  }

export default function ExpensesNavbar({ activeTab, handleChange}: ExpensesNavbarProps) {

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        color: 'white',
        padding: '10px 30px',
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleChange}
        textColor="inherit"
        indicatorColor="primary"
        aria-label="navbar"
      >
        <Tab label="Summary" value="summary" />
        <Tab label="Balances" value="balances" />
      </Tabs>
    </Box>
  );
}
