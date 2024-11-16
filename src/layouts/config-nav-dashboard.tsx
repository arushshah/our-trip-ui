import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';
import InfoIcon from '@mui/icons-material/Info';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PaidIcon from '@mui/icons-material/Paid';
import MapIcon from '@mui/icons-material/Map';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navDataHomepage = [
  {
    title: 'My Homepage',
    path: '/home',
    icon: icon('ic-analytics'),
  },
  {
    title: 'My Trip Invites',
    path: '/trip-invites',
    icon: icon('ic-user'),
  },
  {
    title: 'Product',
    path: '/products',
    icon: icon('ic-cart'),
    info: (
      <Label color="error" variant="inverted">
        +3
      </Label>
    ),
  },
  {
    title: 'Blog',
    path: '/blog',
    icon: icon('ic-blog'),
  },
];

export const getNavDataTrip = (tripId: string | null) => [
  {
    title: 'Trip Information',
    path: tripId ? `/view-trip/${tripId}` : '/',
    icon: <InfoIcon />
  },
  {
    title: 'Guests',
    path: tripId ? `/view-guests/${tripId}` : '/',
    icon: <PeopleIcon />
  },
  {
    title: 'Travel Docs',
    path: tripId ? `/travel-docs/${tripId}` : '/',
    icon: <FlightIcon />,
  },
  {
    title: 'Accommodation Docs',
    path: tripId ? `/accommodations/${tripId}` : '/',
    icon: <HotelIcon />
  },
  {
    title: 'Itinerary',
    path: '/',
    icon: <AutoStoriesIcon />
  },
  {
    title: 'To-Do',
    path: tripId ? `/todo-list/${tripId}` : '/',
    icon: <FormatListBulletedIcon />
  },
  {
    title: 'Locations',
    path: tripId ? `/saved-locations/${tripId}` : '/',
    icon: <MapIcon />
  },
  {
    title: 'Expenses',
    path: tripId ? `/expenses/${tripId}` : '/',
    icon: <PaidIcon />
  },
];
