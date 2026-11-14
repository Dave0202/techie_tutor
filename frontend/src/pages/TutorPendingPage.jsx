import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function TutorPendingPage() {
  return (
    <div className="container page-content">
      <div className="feature-card tutor-pending-card">
        <div className="icon-box"><CheckCircle2 size={22} /></div>
        <span className="eyebrow">Tutor approval</span>
        <h1 className="page-heading">Your profile is awaiting admin review.</h1>
        <p>You can update your profile while it is under review. Your listing, bookings, and resource publishing will be enabled after an administrator confirms your account.</p>
        <Link to="/tutor/profile" className="btn btn-primary">Review my profile</Link>
      </div>
    </div>
  );
}
