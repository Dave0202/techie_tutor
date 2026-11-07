import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '78vh' }}>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <span>© 2026 TechieTutor</span>
          <span>Learn. Create. Succeed.</span>
        </div>
      </footer>
    </>
  );
}
