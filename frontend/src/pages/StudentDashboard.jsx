import { ArrowRight, BookOpenText, CalendarDays, Sparkles, Star, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TutorPortrait from '../components/TutorPortrait';
import FeedbackState from '../components/FeedbackState';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDateTime, formatDate } from '../utils/formatters';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError('');
        const [sessionsRes, tutorsRes, resourcesRes] = await Promise.all([
          api.get('/sessions/my-sessions'),
          api.get('/tutors'),
          api.get('/resources')
        ]);
        setSessions(sessionsRes.data || []);
        setTutors((tutorsRes.data || []).slice(0, 3));
        setResources(resourcesRes.data || []);
      } catch {
        setError('We could not load your learning overview. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [refresh]);

  const stats = useMemo(() => ({
    upcoming: sessions.filter((session) => ['PENDING', 'CONFIRMED'].includes(session.status) && new Date(session.scheduledTime).getTime() > Date.now()).length,
    pending: sessions.filter((session) => session.status === 'PENDING').length,
    completed: sessions.filter((session) => session.status === 'COMPLETED').length,
    resources: resources.length,
  }), [sessions, resources]);

  const upcomingSessions = sessions
    .filter((session) => ['PENDING', 'CONFIRMED'].includes(session.status) && new Date(session.scheduledTime).getTime() > Date.now())
    .sort((first, second) => new Date(first.scheduledTime) - new Date(second.scheduledTime))
    .slice(0, 3);
  const recentResources = resources.slice(0, 3);

  if (loading) {
    return (
      <div className="container page-content">
        <FeedbackState type="loading" layout="dashboard" title="Getting your learning space ready" description="Loading your sessions and recommendations." />
      </div>
    );
  }

  if (error) {
    return <div className="container page-content"><FeedbackState type="error" title="Dashboard unavailable" description={error} action={<button type="button" className="btn btn-primary" onClick={() => { setLoading(true); setRefresh((current) => current + 1); }}>Try again</button>} /></div>;
  }

  return (
    <div className="container page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">Student dashboard</div>
          <h1 className="page-heading" style={{ margin: '0.7rem 0 0', fontSize: '2.4rem' }}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'Learner'} 👋</h1>
          <p>Ready to continue learning?</p>
        </div>
        <Link to="/tutors" className="btn btn-primary">Find a tutor <ArrowRight size={16} /></Link>
      </div>

      <div className="dashboard-grid">
        <div className="metric-card">
          <div className="muted-label">Upcoming sessions</div>
          <div className="value">{stats.upcoming}</div>
        </div>
        <div className="metric-card">
          <div className="muted-label">Pending requests</div>
          <div className="value">{stats.pending}</div>
        </div>
        <div className="metric-card">
          <div className="muted-label">Completed sessions</div>
          <div className="value">{stats.completed}</div>
        </div>
        <div className="metric-card">
          <div className="muted-label">Learning resources</div>
          <div className="value">{stats.resources}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        <div className="feature-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Upcoming sessions</h3>
            <Link to="/sessions" className="text-link">View all</Link>
          </div>
          {upcomingSessions.length ? (
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {upcomingSessions.map((session) => (
                <div key={session.id} className="session-mini-card">
                  <div>
                    <strong>{session.tutorName}</strong>
                    <div className="muted-label">{session.subject || 'Tutoring session'} · {session.durationMinutes || 60} min · {formatDateTime(session.scheduledTime)}</div>
                  </div>
                  <StatusBadge status={session.status} />
                </div>
              ))}
            </div>
          ) : (
            <FeedbackState type="empty" title="No upcoming sessions" description="Your scheduled lessons will appear here." action={<Link to="/tutors" className="btn btn-primary">Find a tutor</Link>} />
          )}
        </div>

        <div className="feature-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Recommended tutors</h3>
            <Link to="/tutors" className="text-link">Explore</Link>
          </div>
          {tutors.length ? (
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {tutors.map((tutor) => (
                <div key={tutor.id} className="session-mini-card">
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <TutorPortrait id={tutor.id} name={tutor.name} className="avatar small tutor-card-portrait" />
                    <div>
                      <strong>{tutor.name}</strong>
                      <div className="muted-label">{tutor.subjects?.split(',')[0] || 'General support'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="tutor-price">{formatCurrency(tutor.hourlyRate)}/hr</div>
                    <Link to={`/tutors/${tutor.id}`} className="muted-label text-link">View profile</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <FeedbackState type="empty" title="No tutor recommendations yet" description="Browse tutors by subject to find a learning match." action={<Link to="/tutors" className="btn btn-secondary">Browse tutors</Link>} />
          )}
        </div>
      </div>

      <div className="dashboard-lower-grid">
        <section className="feature-card dashboard-list-card">
          <div className="dashboard-section-heading">
            <div>
              <span className="eyebrow"><BookOpenText size={14} /> Learning library</span>
              <h2>Resources for your next study session.</h2>
            </div>
            <Link to="/resources" className="text-link">Browse all</Link>
          </div>
          {recentResources.length ? (
            <div className="dashboard-resource-list">
              {recentResources.map((resource) => (
                <article key={resource.id} className="dashboard-resource-item">
                  <div className="icon-box icon-box-accent"><BookOpenText size={18} /></div>
                  <div className="dashboard-resource-copy">
                    <strong>{resource.title}</strong>
                    <span>{resource.tutorName} · {formatDate(resource.createdAt)}</span>
                  </div>
                  <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="text-link">Open</a>
                </article>
              ))}
            </div>
          ) : (
            <FeedbackState type="empty" title="No resources yet" description="Tutor-shared study materials will appear here." action={<Link to="/resources" className="btn btn-secondary">Explore resources</Link>} />
          )}
        </section>

        <section className="feature-card dashboard-list-card">
          <div className="dashboard-section-heading">
            <div>
              <span className="eyebrow"><Sparkles size={14} /> Keep your momentum</span>
              <h2>Your learning journey, in one place.</h2>
            </div>
          </div>
          <div className="dashboard-support-grid">
            {[
              { title: 'Track progress', body: 'Keep an eye on upcoming and completed sessions.', icon: CalendarDays },
              { title: 'Find your match', body: 'Explore tutors for your next learning goal.', icon: Users },
              { title: 'Stay prepared', body: 'Use tutor-shared resources between sessions.', icon: Star }
            ].map(({ title, body, icon: Icon }) => (
              <div key={title} className="dashboard-support-item">
                <div className="icon-box"><Icon size={20} /></div>
                <div><strong>{title}</strong><p>{body}</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}
