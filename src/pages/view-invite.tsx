import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';

import { ViewInviteView } from 'src/sections/invite';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Update Trip - ${CONFIG.appName}`}</title>
      </Helmet>

      <ViewInviteView />
    </>
  );
}
