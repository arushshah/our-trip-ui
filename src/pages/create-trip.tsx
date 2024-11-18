import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CreateTripView } from 'src/sections/trip';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Create Trip - ${CONFIG.appName}`}</title>
      </Helmet>

      <CreateTripView />
    </>
  );
}
