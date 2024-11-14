import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { TodoListView } from 'src/sections/todo-list/todo-list-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Update Trip - ${CONFIG.appName}`}</title>
      </Helmet>

      <TodoListView />
    </>
  );
}
