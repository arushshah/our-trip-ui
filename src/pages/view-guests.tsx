import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import GuestView from 'src/sections/guests/guest-view';

// ----------------------------------------------------------------------

export default function Page() {
    const { trip_id } = useParams<{ trip_id: string }>() || {};
    const tripId = trip_id || '';
  return (
    <>
      <Helmet>
        <title> {`Update Trip - ${CONFIG.appName}`}</title>
      </Helmet>
      <GuestView trip_id={tripId} show_invited_guests={false}/>
    </>
  );
}
