import { BookOpenText, CalendarDays, CheckCircle2, Clock3, MessageSquareText, Users, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FeedbackState from '../components/FeedbackState';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDateTime } from '../utils/formatters';

function isUpcoming(session) {
  return ['PENDING', 'CONFIRMED'].includes(session.status)
    && new Date(session.scheduledTime).getTime() > Date.now();
}

export default function TutorDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [updatingSessionId, setUpdatingSessionId] = useState(null);

  useEffect(() => {
    let active = true;

    const loadTutorData = async () => {
      try {
        setError('');
        const [sessionsRes, resourcesRes] = await Promise.all([
          api.get('/sessions/my-sessions'),
          api.get('/resources')
        ]);
        if (!active) return;
        setSessions(sessionsRes.data || []);
        setResources((resourcesRes.data || []).filter((resource) => String(resource.tutorId) === String(user?.id)));
      } catch {
        if (active) setError('We could not load your teaching overview. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (user) loadTutorData();
    return () => { active = false; };
  }, [user, refresh]);

  const stats = useMemo(() => ({
    students: new Set(sessions.map((session) => session.studentId).filter(Boolean)).size,
    pending: sessions.filter((session) => session.status === 'PENDING').length,
    upcoming: sessions.filter(isUpcoming).length,
    completed: sessions.filter((session) => session.status === 'COMPLETED').length,
  }), [sessions]);

  const pendingSessions = sessions
    .filter((session) => session.status === 'PENDING')
    .sort((first, second) => new Date(first.scheduledTime) - new Date(second.scheduledTime));
  const upcomingSessions = sessions
    .filter((session) => session.status === 'CONFIRMED' && isUpcoming(session))
    .sort((first, second) => new Date(first.scheduledTime) - new Date(second.scheduledTime))
    .slice(0, 4);

  const updateStatus = async (sessionId, status) => {
    setUpdatingSessionId(sessionId);
    setError('');
    try {
      const response = await api.patch(`/sessions/${sessionId}/status?status=${status}`);
      setSessions((current) => current.map((session) => (
        session.id === sessionId ? { ...session, ...response.data } : session
      )));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not update that booking. Please try again.');
    } finally {
      setUpdatingSessionId(null);
    }
  };

  if (loading) {
    return (
      <div className="container page-content">
        <FeedbackState type="loading" layout="dashboard" title="Getting your teaching space ready" description="Loading your sessions and resources." />
      </div>
    );
  }

  if (error && !sessions.length && !resources.length) {
    return (
      <div className="container page-content">
        <FeedbackState type="error" title="Dashboard unavailable" description={error} action={<button type="button" className="btn btn-primary" onClick={() => { setLoading(true); setRefresh((current) => current + 1); }}>Try again</button>} />
      </div>
    );
  }

  return (
    <div className="container page-content">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">Tutor dashboard</div>
          <h1 className="page-heading" style={{ margin: '0.7rem 0 0', fontSize: '2.4rem' }}>Welcome back, {user?.name?.split(' ')[0] || 'Tutor'} 👋</h1>
          <p>Here’s what’s happening with your teaching.</p>
        </div>
        <Link to="/tutor/profile" className="btn btn-primary">Edit my profile</Link>
      </div>

      {error && <div className="alert alert-error page-alert" role="alert">{error}</div>}

      <div className="dashboard-grid">
        <div className="metric-card"><div className="muted-label">Total students</div><div className="value">{stats.students}</div></div>
        <div className="metric-card"><div className="muted-label">Pending requests</div><div className="value">{stats.pending}</div></div>
        <div className="metric-card"><div className="muted-label">Upcoming sessions</div><div className="value">{stats.upcoming}</div></div>
        <div className="metric-card"><div className="muted-label">Completed sessions</div><div className="value">{stats.completed}</div></div>
      </div>

      <section className="feature-card dashboard-list-card dashboard-pending-card">
        <div className="dashboard-section-heading">
          <div>
            <span className="eyebrow"><Clock3 size={14} /> Action needed</span>
            <h2>Booking requests</h2>
          </div>
          <Link to="/sessions" className="text-link">Manage sessions</Link>
        </div>
        {pendingSessions.length ? (
          <div className="dashboard-request-list">
            {pendingSessions.map((session) => (
              <article key={session.id} className="dashboard-request-item">
                <div className="dashboard-request-person">
                  <div className="avatar">{session.studentName?.charAt(0)?.toUpperCase() || <Users size={18} />}</div>
                  <div>
                    <strong>{session.studentName || 'Student'}</strong>
                    <span>{session.subject || 'Tutoring session'} · {session.durationMinutes || 60} min</span>
                    <span>{formatDateTime(session.scheduledTime)}</span>
                  </div>
                </div>
                <div className="dashboard-request-actions">
                  <StatusBadge status={session.status} />
                  <button type="button" className="btn btn-primary" onClick={() => updateStatus(session.id, 'CONFIRMED')} disabled={updatingSessionId === session.id}>
                    {updatingSessionId === session.id ? 'Updating...' : <><CheckCircle2 size={16} /> Accept</>}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => updateStatus(session.id, 'CANCELLED')} disabled={updatingSessionId === session.id} aria-label={`Cancel request from ${session.studentName || 'student'}`}>
                    <XCircle size={16} /> Decline
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <FeedbackState type="empty" title="No pending requests" description="New student booking requests will appear here." />
        )}
      </section>

      <div className="grid-2 dashboard-content-grid">
        <section className="feature-card dashboard-list-card">
          <div className="dashboard-section-heading">
            <div>
              <span className="eyebrow"><CalendarDays size={14} /> Confirmed</span>
              <h2>Upcoming sessions</h2>
            </div>
            <Link to="/sessions" className="text-link">View all</Link>
          </div>
          {upcomingSessions.length ? (
            <div className="dashboard-resource-list">
              {upcomingSessions.map((session) => (
                <article key={session.id} className="dashboard-resource-item">
                  <div className="icon-box"><CalendarDays size={18} /></div>
                  <div className="dashboard-resource-copy">
                    <strong>{session.studentName || 'Student'}</strong>
                    <span>{session.subject || 'Tutoring session'} · {session.durationMinutes || 60} min</span>
                    <span>{formatDateTime(session.scheduledTime)}</span>
                  </div>
                  <StatusBadge status={session.status} />
                </article>
              ))}
            </div>
          ) : (
            <FeedbackState type="empty" title="No upcoming sessions" description="Confirmed sessions will appear here." />
          )}
        </section>

        <section className="feature-card dashboard-list-card">
          <div className="dashboard-section-heading">
            <div>
              <span className="eyebrow"><BookOpenText size={14} /> Teaching materials</span>
              <h2>Your learning resources</h2>
            </div>
            <Link to="/resources" className="text-link">Manage</Link>
          </div>
          {resources.length ? (
            <div className="dashboard-resource-list">
              {resources.slice(0, 4).map((resource) => (
                <article key={resource.id} className="dashboard-resource-item">
                  <div className="icon-box icon-box-accent"><BookOpenText size={18} /></div>
                  <div className="dashboard-resource-copy">
                    <strong>{resource.title}</strong>
                    <span>{formatDate(resource.createdAt)}</span>
                  </div>
                  <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="text-link">Open</a>
                </article>
              ))}
            </div>
          ) : (
            <FeedbackState type="empty" title="No resources published yet" description="Share a useful learning link with your students." action={<Link to="/resources" className="btn btn-secondary">Add a resource</Link>} />
          )}
        </section>
      </div>

      <section className="section tutor-tools-section">
        <div className="section-header">
          <span className="eyebrow"><MessageSquareText size={14} /> Tutor tools</span>
          <h2>Keep every lesson moving forward.</h2>
        </div>
        <div className="grid-3">
          {[
            { title: 'Manage sessions', body: 'Review requests and keep your upcoming schedule up to date.', icon: CalendarDays, href: '/sessions' },
            { title: 'Update your profile', body: 'Help learners understand your teaching experience and subjects.', icon: Users, href: '/tutor/profile' },
            { title: 'Share resources', body: 'Publish links to study materials students can use between lessons.', icon: BookOpenText, href: '/resources' }
          ].map(({ title, body, icon: Icon, href }) => (
            <Link key={title} to={href} className="feature-card tutor-tool-card">
              <div className="icon-box"><Icon size={20} /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
