import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CreateAccountView } from 'src/sections/auth/create-account-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Sign in - ${CONFIG.appName}`}</title>
      </Helmet>

      <CreateAccountView />
    </>
  );
}
