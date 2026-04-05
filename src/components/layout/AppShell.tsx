import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}
