import { CalendarDays, Clock3, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import TutorPortrait from '../components/TutorPortrait';
import FeedbackState from '../components/FeedbackState';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getLocalDateValue } from '../utils/formatters';

export default function TutorProfilePage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refresh, setRefresh] = useState(0);
  const availableSubjects = useMemo(() => (tutor?.subjects || '')
    .split(',')
    .map((subject) => subject.trim())
    .filter(Boolean), [tutor?.subjects]);
  const hourlyRate = Number(tutor?.hourlyRate);
  const estimatedTotal = Number.isFinite(hourlyRate) ? hourlyRate * durationMinutes / 60 : null;
  const sessionTime = selectedDate && selectedTime
    ? new Date(`${selectedDate}T${selectedTime}:00`)
    : null;
  const bookingDateIsPast = sessionTime && sessionTime.getTime() <= Date.now();

  const timeOptions = useMemo(() => Array.from({ length: 23 }, (_, index) => {
    const minutes = 9 * 60 + index * 30;
    const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
    const minute = String(minutes % 60).padStart(2, '0');
    return { value: `${hour}:${minute}`, minutes };
  }).filter((time) => time.minutes + durationMinutes <= 20 * 60), [durationMinutes]);

  useEffect(() => {
    if (availableSubjects.length && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [selectedSubject, availableSubjects]);

  useEffect(() => {
    if (selectedTime && !timeOptions.some((time) => time.value === selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedTime, timeOptions]);

  useEffect(() => {
    const fetchTutor = async () => {
      setLoading(true);
      setError('');
      setTutor(null);
      try {
        const response = await api.get(`/tutors/${id}`);
        setTutor(response.data);
      } catch (err) {
        setError('Tutor profile could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [id, refresh]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Choose a session date and start time to continue.');
      return;
    }
    if (bookingDateIsPast) {
      setError('Choose a future date and time for the session.');
      return;
    }
    if (!selectedSubject) {
      setError('Choose the subject you would like to study.');
      return;
    }

    setBooking(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/sessions/book', {
        tutorId: Number(id),
        scheduledTime: `${selectedDate}T${selectedTime}:00`,
        durationMinutes,
        subject: selectedSubject,
      });
      setSuccess('Session request sent successfully.');
      setSelectedDate('');
      setSelectedTime('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to book this session.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="container page-content"><FeedbackState type="loading" layout="profile" title="Loading tutor profile" description="Getting the details you need to make a great match." /></div>;
  }

  if (error && !tutor) {
    return (
      <div className="container page-content">
        <FeedbackState type="error" title="Tutor profile unavailable" description={error} action={<button type="button" className="btn btn-primary" onClick={() => { setError(''); setLoading(true); setRefresh((current) => current + 1); }}>Try again</button>} />
      </div>
    );
  }

  if (!tutor) {
    return <div className="container page-content"><FeedbackState type="empty" title="Tutor not found" description="This profile may no longer be available." action={<Link to="/tutors" className="btn btn-secondary">Browse tutors</Link>} /></div>;
  }

  return (
    <div className="container page-content">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Meet your tutor</span>
          <h1 className="page-heading">A great learning match starts here.</h1>
        </div>
        <Link to="/tutors" className="btn btn-ghost">Back to tutors</Link>
      </div>
      <div className="grid-2 profile-grid">
        <div className="feature-card profile-summary">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <TutorPortrait id={tutor.id} name={tutor.name} className="avatar tutor-profile-portrait" />
            <div>
              <h2 style={{ margin: 0 }}>{tutor.name}</h2>
              <div className="muted-label">TechieTutor · Tutor</div>
            </div>
          </div>

          <p style={{ marginTop: '1rem', lineHeight: 1.8 }}>{tutor.bio || 'Dedicated tutor focused on building confidence and helping learners master core concepts.'}</p>

          <div className="subject-badges" style={{ margin: '1.2rem 0 0' }}>
            {(tutor.subjects || 'General support').split(',').map((tag) => <span key={tag}>{tag.trim()}</span>)}
          </div>

          <div style={{ marginTop: '1.25rem', display: 'grid', gap: '0.8rem' }}>
            <div className="hero-stat"><span>Hourly rate</span><strong className="tutor-price-accent">{formatCurrency(tutor.hourlyRate)} / hour</strong></div>
            <div className="hero-stat"><span>Learning format</span><strong>One-to-one</strong></div>
          </div>
        </div>

        <div className="feature-card">
          <div className="eyebrow"><CalendarDays size={14} /> Book a session</div>
          <h2 className="page-heading" style={{ margin: '1rem 0 0.8rem', fontSize: '1.45rem' }}>Book your session</h2>

          {error && <div className="alert alert-error page-alert" role="alert">{error}</div>}
          {success && <div className="alert alert-success page-alert booking-success" role="status">
            {success} <Link to="/sessions" className="text-link">View your sessions</Link>
          </div>}

          <div className="field-group">
            <label className="field-label" htmlFor="booking-subject">Subject</label>
            <select id="booking-subject" className="input" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} required>
              {availableSubjects.length ? availableSubjects.map((subject) => <option key={subject} value={subject}>{subject}</option>) : <option value="General tutoring">General tutoring</option>}
            </select>
          </div>

          <div className="booking-fields">
            <div className="field-group">
              <label className="field-label" htmlFor="booking-date">Date</label>
              <input id="booking-date" className="input" type="date" min={getLocalDateValue()} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} required />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="booking-time">Start time</label>
              <select id="booking-time" className="input" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)} required>
                <option value="">Choose a time</option>
                {timeOptions.map(({ value }) => <option key={value} value={value}>{new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }).format(new Date(`2000-01-01T${value}:00`))}</option>)}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="booking-duration">Session duration</label>
            <select id="booking-duration" className="input" value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))}>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1 hour 30 minutes</option>
            </select>
          </div>

          <div className="booking-summary" aria-live="polite">
            <div className="booking-summary-title"><strong>Booking summary</strong><span>Request details</span></div>
            <div className="booking-summary-row"><span>Tutor</span><strong>{tutor.name}</strong></div>
            <div className="booking-summary-row"><span>Subject</span><strong>{selectedSubject || 'Choose a subject'}</strong></div>
            <div className="booking-summary-row"><span>Duration</span><strong>{durationMinutes} minutes</strong></div>
            <div className="booking-summary-total"><span>Estimated session total</span><strong>{estimatedTotal === null ? 'Price on request' : formatCurrency(estimatedTotal)}</strong></div>
            <small>Based on {formatCurrency(tutor.hourlyRate)} per hour. Payment is not collected through this booking request.</small>
          </div>

          {user?.role === 'STUDENT' ? (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleBooking} disabled={booking}>
              {booking ? <><Loader2 size={16} className="loading-dots" /> Sending request...</> : 'Confirm booking request'}
            </button>
          ) : isAuthenticated ? (
            <div className="alert alert-error" role="status">Only student accounts can request a session.</div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>Sign in to book</Link>
          )}

          <div style={{ marginTop: '1rem', color: '#475569' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}><Clock3 size={16} /> Your tutor will confirm the request</div>
            <div>Choose a start time between 9:00 AM and 8:00 PM.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
