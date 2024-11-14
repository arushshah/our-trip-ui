import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { ExpensesView } from 'src/sections/expenses/expenses-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Update Trip - ${CONFIG.appName}`}</title>
      </Helmet>

      <ExpensesView />
    </>
  );
}
