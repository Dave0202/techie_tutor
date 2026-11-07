import { CalendarDays, FileText, Loader2, Link2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FeedbackState from '../components/FeedbackState';
import { formatDate } from '../utils/formatters';

export default function ResourcePage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', fileUrl: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refresh, setRefresh] = useState(0);

  const fetchResources = async () => {
    try {
      setError('');
      const response = await api.get('/resources');
      setResources(response.data || []);
      return true;
    } catch {
      setError('We could not load the learning library. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [refresh]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    if (!/^https?:\/\//i.test(form.fileUrl.trim())) {
      setError('Enter a secure resource link beginning with https://.');
      setSubmitting(false);
      return;
    }
    try {
      await api.post('/resources/upload', form);
      setForm({ title: '', description: '', fileUrl: '' });
      const loaded = await fetchResources();
      if (loaded) setSuccess('Your learning resource has been published.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not publish this resource. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-content">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">Learning resources</div>
          <h1 className="page-heading" style={{ margin: '0.7rem 0 0', fontSize: '2.4rem' }}>{user?.role === 'TUTOR' ? 'Share what you know.' : 'Your learning library.'}</h1>
          <p>Helpful material shared by tutors to support learning beyond each session.</p>
        </div>
      </div>

      {user?.role === 'TUTOR' && (
        <div className="form-card resource-form">
          <h3 style={{ marginTop: 0 }}>Publish a resource link</h3>
          <p className="field-help">Share a link to a document, lesson, or trusted learning site.</p>
          {error && <div className="alert alert-error page-alert" role="alert">{error}</div>}
          {success && <div className="alert alert-success page-alert" role="status">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="title">Title</label>
              <input id="title" name="title" className="input" value={form.title} onChange={handleChange} placeholder="Algebra revision pack" required />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="fileUrl">Resource link</label>
              <input id="fileUrl" name="fileUrl" className="input" type="url" value={form.fileUrl} onChange={handleChange} placeholder="https://example.com/notes.pdf" required />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="description">Description</label>
              <textarea id="description" name="description" className="input" rows="4" value={form.description} onChange={handleChange} placeholder="Short description of what learners will find useful." />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? <><Loader2 size={16} className="loading-dots" /> Publishing...</> : <><Link2 size={16} /> Publish resource</>}
            </button>
          </form>
        </div>
      )}

      {user?.role !== 'TUTOR' && error && <div className="alert alert-error page-alert" role="alert">{error}</div>}
      {loading ? (
        <FeedbackState type="loading" layout="cards" title="Opening the learning library" description="Loading shared resources." />
      ) : error && !resources.length ? (
        <FeedbackState type="error" title="Learning library unavailable" description={error} action={<button type="button" className="btn btn-primary" onClick={() => { setLoading(true); setRefresh((current) => current + 1); }}>Try again</button>} />
      ) : resources.length ? (
        <div className="resource-grid">
          {resources.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div className="icon-box icon-box-accent"><FileText size={18} /></div>
              <h3>{resource.title}</h3>
              <p>{resource.description || 'Helpful study material from a tutor.'}</p>
              <div className="resource-meta">
                <span><Users size={14} /> {resource.tutorName}</span>
                <span><CalendarDays size={14} /> {formatDate(resource.createdAt)}</span>
              </div>
              <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary"><Link2 size={16} /> Open resource</a>
            </div>
          ))}
        </div>
      ) : (
        <FeedbackState type="empty" title="No resources yet" description={user?.role === 'TUTOR' ? 'Publish your first resource to help learners get more from their sessions.' : 'Tutor-shared study materials will appear here.'} />
      )}
    </div>
  );
}
