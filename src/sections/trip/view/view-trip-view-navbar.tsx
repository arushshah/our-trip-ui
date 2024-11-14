import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PaidIcon from '@mui/icons-material/Paid';
import MapIcon from '@mui/icons-material/Map';

interface CustomTabProps {
  selected: boolean;
  label: string;
  href: string;
  icon: React.ReactElement;
}

const CustomTab: React.FC<CustomTabProps> = ({ selected, label, href, icon, ...props }) =>
    <Tab
      component={Link}
      to={href}
      aria-current={selected ? 'page' : undefined}
      label={label}
      icon={icon}
      iconPosition="start"
      sx={{ mx: 5, fontSize: { xs: 14, sm: 16, md: 18, lg: 20 }, color: '#EEEEEE' }} // Responsive font size
      {...props}
    />

interface ViewTripViewNavbarProps {
  trip_id: string;
}

const ViewTripViewNavbar: React.FC<ViewTripViewNavbarProps> = ({ trip_id }) => {
  const location = useLocation();
  const [value, setValue] = useState(0);

  useLayoutEffect(() => {
    if (location.pathname.includes('/view-trip')) {
      setValue(0);
    } else if (location.pathname.includes('/travel-docs')) {
      setValue(1);
    } else if (location.pathname.includes('/accommodations')) {
      setValue(2);
    } else if (location.pathname.includes('/view-guests')) {
      setValue(3);
    } else if (location.pathname.includes('/view-itinerary')) {
      setValue(4);
    } else if (location.pathname.includes('/todo-list')) {
      setValue(5);
    } else if (location.pathname.includes('/expenses')) {
      setValue(6);
    } else if (location.pathname.includes('/saved-locations')) {
      setValue(7);
    }
    
  }, [location]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
      <Tabs
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        >
      <CustomTab label="Trip Information" href={`/view-trip/${trip_id}`} selected={value === 0} icon={<InfoIcon />} />
      <CustomTab label="Travel Docs" href={`/travel-docs/${trip_id}`} selected={value === 1} icon={<FlightIcon />} />
      <CustomTab label="Accommodation Docs" href={`/accommodations/${trip_id}`} selected={value === 2} icon={<HotelIcon />} />
      <CustomTab label="Guests" href={`/view-guests/${trip_id}`} selected={value === 3} icon={<PeopleIcon />} />
      <CustomTab label="Itinerary" href={`/itinerary/${trip_id}`} selected={value === 4} icon={<AutoStoriesIcon />} />
      <CustomTab label="To-Do" href={`/todo-list/${trip_id}`} selected={value === 5} icon={<FormatListBulletedIcon />} />
      <CustomTab label="Expenses" href={`/expenses/${trip_id}`} selected={value === 6} icon={<PaidIcon />} />
      <CustomTab label="Locations" href={`/saved-locations/${trip_id}`} selected={value === 7} icon={<MapIcon />} />
    </Tabs>
    </Box>
  );
};

export default ViewTripViewNavbar;