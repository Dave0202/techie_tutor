import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FeedbackState from '../components/FeedbackState';
import api from '../services/api';

const emptyProfile = { bio: '', subjects: '', hourlyRate: '' };

export default function TutorProfileEditPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await api.get('/tutors');
        const profile = (response.data || []).find((item) => String(item.userId) === String(user?.id));
        if (active && profile) {
          setForm({
            bio: profile.bio || '',
            subjects: profile.subjects || '',
            hourlyRate: profile.hourlyRate ?? '',
          });
        }
      } catch {
        if (active) setError('We could not load your tutor profile. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (user) loadProfile();
    return () => { active = false; };
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.bio.trim() || !form.subjects.trim() || !form.hourlyRate || Number(form.hourlyRate) < 0) {
      setError('Add a short bio, at least one subject, and a valid hourly rate.');
      return;
    }

    setSaving(true);
    try {
      await api.put('/tutors/profile', {
        bio: form.bio.trim(),
        subjects: form.subjects.trim(),
        hourlyRate: Number(form.hourlyRate),
      });
      setSuccess('Your tutor profile has been saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-content">
        <FeedbackState type="loading" title="Loading your profile" description="Your profile details will be ready in a moment." />
      </div>
    );
  }

  return (
    <div className="container page-content">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Tutor profile</span>
          <h1 className="page-heading">Tell learners about you.</h1>
          <p>Share what you teach and what students can expect from a session.</p>
        </div>
        <Link to="/dashboard" className="btn btn-ghost"><ArrowLeft size={16} /> Back to dashboard</Link>
      </div>

      <form className="form-card profile-edit-card" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error page-alert" role="alert">{error}</div>}
        {success && <div className="alert alert-success page-alert" role="status">{success}</div>}

        <div className="field-group">
          <label className="field-label" htmlFor="bio">About you</label>
          <textarea id="bio" name="bio" className="input" rows="5" maxLength="1200" value={form.bio} onChange={handleChange} placeholder="Describe your teaching experience and approach." required />
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="subjects">Subjects</label>
          <input id="subjects" name="subjects" className="input" value={form.subjects} onChange={handleChange} placeholder="Mathematics, Python, ICT" required />
          <small className="field-help">Separate subjects with commas.</small>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="hourlyRate">Hourly rate (£)</label>
          <input id="hourlyRate" name="hourlyRate" className="input" type="number" min="0" step="0.01" value={form.hourlyRate} onChange={handleChange} required />
        </div>

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? <><Loader2 size={16} className="loading-dots" /> Saving profile...</> : <><Save size={16} /> Save profile</>}
        </button>
      </form>
    </div>
  );
}
