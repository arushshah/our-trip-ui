import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import CreateTravelDocView from 'src/sections/travel/create-travel-doc-view';

// ----------------------------------------------------------------------

export default function Page() {
  const { trip_id } = useParams<{ trip_id: string }>();
  return (
    <>
      <Helmet>
        <title> {`Dashboard - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="The starting point for your next project with Minimal UI Kit, built on the newest version of Material-UI ©, ready to be customized to your style"
        />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <CreateTravelDocView />
    </>
  );
}
