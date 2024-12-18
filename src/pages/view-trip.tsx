import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ViewTripView } from 'src/sections/trip';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Update Trip - ${CONFIG.appName}`}</title>
      </Helmet>

      <ViewTripView />
    </>
  );
}
