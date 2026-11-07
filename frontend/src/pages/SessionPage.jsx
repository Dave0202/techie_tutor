import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FeedbackState from '../components/FeedbackState';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../utils/formatters';

export default function SessionPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [updatingSessionId, setUpdatingSessionId] = useState(null);

  const loadSessions = async () => {
    try {
      setError('');
      const response = await api.get('/sessions/my-sessions');
      setSessions(response.data || []);
      return true;
    } catch {
      setError('We could not load your sessions. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [refresh]);

  const updateStatus = async (id, status) => {
    if (user?.role === 'STUDENT' && status === 'CANCELLED' && !window.confirm('Cancel this session request?')) return;
    setUpdatingSessionId(id);
    setError('');
    try {
      await api.patch(`/sessions/${id}/status?status=${status}`);
      await loadSessions();
    } catch (error) {
      setError(error.response?.data?.message || 'We could not update this session. Please try again.');
    } finally {
      setUpdatingSessionId(null);
    }
  };

  if (loading) {
    return <div className="container page-content"><FeedbackState type="loading" layout="cards" title="Loading your sessions" description="Your schedule will be ready in a moment." /></div>;
  }

  if (error && !sessions.length) {
    return <div className="container page-content"><FeedbackState type="error" title="Sessions unavailable" description={error} action={<button type="button" className="btn btn-primary" onClick={() => { setLoading(true); setRefresh((current) => current + 1); }}>Try again</button>} /></div>;
  }

  return (
    <div className="container page-content">
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="eyebrow">My sessions</div>
        <h1 className="page-heading" style={{ margin: '0.7rem 0 0', fontSize: '2.4rem' }}>{user?.role === 'TUTOR' ? 'Session management' : 'Your schedule'}</h1>
      </div>

      {error && <div className="alert alert-error page-alert" role="alert">{error}</div>}
      {sessions.length ? (
        <div className="session-grid">
          {sessions.map((session) => (
            <div key={session.id} className="session-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <StatusBadge status={session.status} />
                <span className="muted-label">ID #{session.id}</span>
              </div>

              <h3 style={{ margin: '0 0 0.7rem' }}>{user?.role === 'TUTOR' ? session.studentName : session.tutorName}</h3>
              <p className="muted-label">{user?.role === 'TUTOR' ? 'Student' : 'Tutor'} · {session.subject || 'Tutoring session'} · {session.durationMinutes || 60} min</p>
              <p style={{ margin: 0, color: '#475569' }}>{formatDateTime(session.scheduledTime)}</p>

              {user?.role === 'TUTOR' && session.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-primary" onClick={() => updateStatus(session.id, 'CONFIRMED')} disabled={updatingSessionId === session.id}>
                    {updatingSessionId === session.id ? <><Loader2 size={16} className="loading-dots" /> Updating...</> : <><CheckCircle2 size={16} /> Accept</>}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => updateStatus(session.id, 'CANCELLED')} disabled={updatingSessionId === session.id}><XCircle size={16} /> Cancel</button>
                </div>
              )}
              {user?.role === 'TUTOR' && session.status === 'CONFIRMED' && (
                <div className="page-actions" style={{ marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => updateStatus(session.id, 'COMPLETED')} disabled={updatingSessionId === session.id}>
                    {updatingSessionId === session.id ? <><Loader2 size={16} className="loading-dots" /> Updating...</> : <><CheckCircle2 size={16} /> Mark completed</>}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => updateStatus(session.id, 'CANCELLED')} disabled={updatingSessionId === session.id}><XCircle size={16} /> Cancel</button>
                </div>
              )}
              {user?.role === 'STUDENT' && ['PENDING', 'CONFIRMED'].includes(session.status) && (
                <button type="button" className="btn btn-danger" style={{ marginTop: '1rem' }} onClick={() => updateStatus(session.id, 'CANCELLED')} disabled={updatingSessionId === session.id}>
                  {updatingSessionId === session.id ? <><Loader2 size={16} className="loading-dots" /> Updating...</> : <><XCircle size={16} /> Cancel session</>}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <FeedbackState type="empty" title="No sessions yet" description={user?.role === 'TUTOR' ? 'When a student books a session, it will appear here.' : 'Book a tutor and your upcoming schedule will appear here.'} />
      )}
    </div>
  );
}
