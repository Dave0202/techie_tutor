import { Menu, X, LogOut, UserCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { getPublicFileUrl } from '../services/api';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { currency, setCurrency, ratesStatus, ratesUpdatedAt } = useCurrency();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;
      if (!navRef.current || !toggleRef.current) return;
      if (!navRef.current.contains(target) && !toggleRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  const guestLinks = [
    { to: '/', label: 'Home' },
    { to: '/tutors', label: 'Find Tutors' },
    { to: '/login', label: 'Login' },
  ];

  const studentLinks = [
    { to: '/', label: 'Home' },
    { to: '/tutors', label: 'Find Tutors' },
    { to: '/sessions', label: 'My Sessions' },
    { to: '/resources', label: 'Resources' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/messages', label: 'Messages' },
  ];

  const tutorLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Sessions' },
    { to: '/tutor/profile', label: 'My Profile' },
    { to: '/resources', label: 'Resources' },
    { to: '/messages', label: 'Messages' },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Sessions' },
    { to: '/resources', label: 'Resources' },
    { to: '/messages', label: 'Messages' },
  ];

  const navItems = !isAuthenticated
    ? guestLinks
    : user?.role === 'ADMIN'
      ? adminLinks
      : user?.role === 'TUTOR'
        ? tutorLinks
        : studentLinks;

  const profileLink = isAuthenticated && (
    <Link to="/profile" className="user-nav-label" onClick={() => setOpen(false)} aria-label="Update profile picture and account profile">
      {user?.profilePictureUrl
        ? <img className="user-nav-avatar" src={getPublicFileUrl(user.profilePictureUrl)} alt="" />
        : <UserCircle2 size={20} />}
      <span>{user?.name}</span>
    </Link>
  );
  const currencyStatus = currency === 'GBP'
    ? ''
    : ratesStatus === 'loading'
      ? 'Loading rates…'
      : ratesStatus === 'error'
        ? 'Rates unavailable'
        : ratesUpdatedAt
          ? `Rates updated ${new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(ratesUpdatedAt)}`
          : 'Rates ready';

  return (
    <nav className="navbar" ref={navRef}>
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark"><img src="/brand/virtualteach-mark.svg" alt="" /></span>
          <span>TechieTutor<span className="brand-mark-accent">.</span></span>
        </Link>

        <div className="nav-links">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>{item.label}</NavLink>
          ))}

          {isAuthenticated && (
            <>
              {profileLink}
              <button className="btn btn-ghost" onClick={handleLogout}><LogOut size={16} /> Logout</button>
            </>
          )}
          {!isAuthenticated && <Link to="/register" className="btn btn-primary">Get started</Link>}
        </div>

        <div className="currency-control">
          <label className="currency-label" htmlFor="display-currency">Currency</label>
          <select
            id="display-currency"
            className="currency-select"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            aria-describedby="currency-status"
            title={currencyStatus || 'Select the currency used to display tutor rates'}
          >
            <option value="GBP">GBP (£)</option>
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
          <span id="currency-status" className="currency-rate-status" role="status" aria-live="polite">{currencyStatus}</span>
        </div>

        <button
          type="button"
          ref={toggleRef}
          className="btn btn-ghost mobile-menu-toggle"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div id="mobile-navigation" className="container mobile-nav-panel">
          <div className="card">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>{item.label}</NavLink>
            ))}
            {isAuthenticated ? (
              <>
                {profileLink}
                <button className="btn btn-danger" onClick={handleLogout}><LogOut size={16} /> Logout</button>
              </>
            ) : (
              <Link to="/register" onClick={() => setOpen(false)} className="btn btn-primary">Get started</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
