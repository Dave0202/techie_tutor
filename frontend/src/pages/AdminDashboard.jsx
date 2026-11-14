import { BookOpenText, CheckCircle2, PauseCircle, RotateCcw, ShieldCheck, Trash2, Users, UserX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackState from '../components/FeedbackState';
import { getPublicFileUrl } from '../services/api';
import api from '../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);
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
    pendingTutors: users.filter((user) => user.role === 'TUTOR' && !user.tutorConfirmed && user.accountStatus === 'ACTIVE').length,
  }), [users]);

  const manageAccount = async (account, action) => {
    const confirmations = {
      suspend: `Suspend ${account.name}? They will lose access until restored.`,
      terminate: `Terminate ${account.name}? This permanently disables the account.`,
      delete: `Delete ${account.name}? Their account will be anonymized while learning history is preserved.`,
    };
    if (confirmations[action] && !window.confirm(confirmations[action])) return;

    setUpdatingUserId(account.id);
    setActionError('');
    try {
      if (action === 'delete') {
        await api.delete(`/admin/users/${account.id}`);
        setUsers((currentUsers) => currentUsers.map((user) => (
          user.id === account.id
            ? { ...user, name: 'Deleted account', email: `deleted+${user.id}@deleted.invalid`, accountStatus: 'DELETED', tutorConfirmed: false }
            : user
        )));
        return;
      }

      const request = action === 'confirm'
        ? api.post(`/admin/users/${account.id}/confirm-tutor`)
        : api.patch(`/admin/users/${account.id}/${action}`);
      const response = await request;
      setUsers((currentUsers) => currentUsers.map((user) => (
        user.id === account.id ? response.data : user
      )));
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.error?.message
        || requestError.response?.data?.message
        || requestError.message
        || 'We could not update this account. Please try again.',
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

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
        <div className="page-actions">
          <Link to="/messages" className="btn btn-secondary">Review messages</Link>
          <Link to="/sessions" className="btn btn-secondary">Review classes</Link>
          <Link to="/resources" className="btn btn-primary"><BookOpenText size={16} /> Post homework or materials</Link>
        </div>
      </div>

      {error && <div className="alert alert-error page-alert" role="alert">{error}</div>}
      {actionError && <div className="alert alert-error page-alert" role="alert">{actionError}</div>}
      <div className="dashboard-grid">
        <div className="metric-card"><div className="muted-label">Students</div><div className="value">{counts.students}</div></div>
        <div className="metric-card"><div className="muted-label">Tutors</div><div className="value">{counts.tutors}</div></div>
        <div className="metric-card"><div className="muted-label">Administrators</div><div className="value">{counts.administrators}</div></div>
        <div className="metric-card"><div className="muted-label">Pending tutor approvals</div><div className="value">{counts.pendingTutors}</div></div>
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
              {account.accountStatus !== 'ACTIVE' && <span className="badge badge-warning">{account.accountStatus}</span>}
              {account.role === 'TUTOR' && (
                account.tutorConfirmed
                  ? <span className="badge badge-success">Confirmed instructor</span>
                  : account.accountStatus === 'ACTIVE' && <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => manageAccount(account, 'confirm')}
                      disabled={updatingUserId === account.id}
                    >
                      <CheckCircle2 size={16} />
                      {updatingUserId === account.id ? 'Confirming...' : 'Confirm instructor'}
                    </button>
              )}
              {account.role !== 'ADMIN' && account.accountStatus !== 'DELETED' && (
                <div className="admin-account-actions">
                  {account.accountStatus === 'SUSPENDED' ? (
                    <button className="btn btn-secondary" type="button" onClick={() => manageAccount(account, 'restore')} disabled={updatingUserId === account.id}>
                      <RotateCcw size={15} /> Restore
                    </button>
                  ) : (
                    <button className="btn btn-secondary" type="button" onClick={() => manageAccount(account, 'suspend')} disabled={updatingUserId === account.id || account.accountStatus !== 'ACTIVE'}>
                      <PauseCircle size={15} /> Suspend
                    </button>
                  )}
                  {account.accountStatus !== 'TERMINATED' && (
                    <button className="btn btn-danger" type="button" onClick={() => manageAccount(account, 'terminate')} disabled={updatingUserId === account.id}>
                      <UserX size={15} /> Terminate
                    </button>
                  )}
                  <button className="btn btn-danger" type="button" onClick={() => manageAccount(account, 'delete')} disabled={updatingUserId === account.id}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
