import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { ViewInviteView } from 'src/sections/invite/view';

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
