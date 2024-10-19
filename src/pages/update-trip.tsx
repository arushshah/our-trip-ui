import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UpdateTripView } from 'src/sections/trip/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Update Trip - ${CONFIG.appName}`}</title>
      </Helmet>

      <UpdateTripView />
    </>
  );
}
