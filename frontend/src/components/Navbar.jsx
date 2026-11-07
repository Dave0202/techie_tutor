import { Menu, X, LogOut, UserCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicFileUrl } from '../services/api';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
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
  ];

  const tutorLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Sessions' },
    { to: '/tutor/profile', label: 'My Profile' },
    { to: '/resources', label: 'Resources' },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/resources', label: 'Resources' },
  ];

  const navItems = !isAuthenticated
    ? guestLinks
    : user?.role === 'ADMIN'
      ? adminLinks
      : user?.role === 'TUTOR'
        ? tutorLinks
        : studentLinks;

  const profileLink = isAuthenticated && (
    <Link to="/profile" className="user-nav-label" aria-label="Update profile picture and account profile">
      {user?.profilePictureUrl
        ? <img className="user-nav-avatar" src={getPublicFileUrl(user.profilePictureUrl)} alt="" />
        : <UserCircle2 size={20} />}
      <span>{user?.name}</span>
    </Link>
  );

  return (
    <nav className="navbar">
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

        <button
          type="button"
          className="btn btn-ghost mobile-menu-toggle"
          onClick={() => setOpen(!open)}
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
