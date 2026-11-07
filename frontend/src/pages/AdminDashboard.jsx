import { BookOpenText, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackState from '../components/FeedbackState';
import { getPublicFileUrl } from '../services/api';
import api from '../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    api.get('/admin/users')
      .then((response) => {
        if (active) setUsers(response.data || []);
      })
      .catch(() => {
        if (active) setError('We could not load the account directory. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [retry]);

  const counts = useMemo(() => ({
    students: users.filter((user) => user.role === 'STUDENT').length,
    tutors: users.filter((user) => user.role === 'TUTOR').length,
    administrators: users.filter((user) => user.role === 'ADMIN').length,
  }), [users]);

  if (loading) {
    return <div className="container page-content"><FeedbackState type="loading" layout="dashboard" title="Opening the admin workspace" description="Loading accounts and platform totals." /></div>;
  }
  if (error && !users.length) {
    return <div className="container page-content"><FeedbackState type="error" title="Admin workspace unavailable" description={error} action={<button className="btn btn-primary" type="button" onClick={() => { setLoading(true); setRetry((current) => current + 1); }}>Try again</button>} /></div>;
  }

  return (
    <div className="container page-content">
      <div className="page-title-row">
        <div>
          <span className="eyebrow"><ShieldCheck size={14} /> Administration</span>
          <h1 className="page-heading">Platform overview.</h1>
          <p>Manage learning materials and keep track of the TechieTutor community.</p>
        </div>
        <Link to="/resources" className="btn btn-primary"><BookOpenText size={16} /> Post homework or materials</Link>
      </div>

      {error && <div className="alert alert-error page-alert" role="alert">{error}</div>}
      <div className="dashboard-grid">
        <div className="metric-card"><div className="muted-label">Students</div><div className="value">{counts.students}</div></div>
        <div className="metric-card"><div className="muted-label">Tutors</div><div className="value">{counts.tutors}</div></div>
        <div className="metric-card"><div className="muted-label">Administrators</div><div className="value">{counts.administrators}</div></div>
        <div className="metric-card"><div className="muted-label">All accounts</div><div className="value">{users.length}</div></div>
      </div>

      <section className="feature-card admin-directory">
        <div className="dashboard-section-heading">
          <div><span className="eyebrow"><Users size={14} /> Community</span><h2>Accounts</h2></div>
          <Link to="/profile" className="text-link">Update my picture</Link>
        </div>
        <div className="admin-user-list">
          {users.map((account) => (
            <article className="admin-user-row" key={account.id}>
              {account.profilePictureUrl
                ? <img className="admin-user-avatar" src={getPublicFileUrl(account.profilePictureUrl)} alt="" />
                : <div className="admin-user-avatar admin-user-initial" aria-hidden="true">{account.name?.charAt(0)?.toUpperCase()}</div>}
              <div className="admin-user-details"><strong>{account.name}</strong><span>{account.email}</span></div>
              <span className="badge badge-primary">{account.role}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
