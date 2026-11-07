import { GraduationCap, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TutorPortrait from '../components/TutorPortrait';
import FeedbackState from '../components/FeedbackState';
import { formatCurrency } from '../utils/formatters';

const popularSubjects = [
  'Mathematics',
  'Python Programming',
  'Scratch Programming',
  'Graphics Design',
  'Creative Writing',
  'AI & Technology',
  'ICT',
  'SATS Preparation',
];

export default function TutorSearchPage() {
  const [subject, setSubject] = useState('');
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/tutors', { params: subject ? { subject } : {} });
        setTutors(response.data || []);
      } catch {
        setError('We could not load the tutor directory. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [subject, refresh]);

  return (
    <div className="container" style={{ padding: '2rem 0 4rem' }}>
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <span className="eyebrow"><Search size={14} /> Tutor directory</span>
        <h1 className="page-heading">Find your perfect tutor.</h1>
        <p>Search expert tutors by subject and find the support that fits your goals.</p>
      </div>

      <div className="form-card" style={{ maxWidth: '760px', margin: '0 auto 2rem' }}>
        <label className="field-label" htmlFor="subject">Search by subject</label>
        <div className="search-box">
          <Search size={18} />
          <input
            id="subject"
            className="input"
            placeholder="Try Mathematics, Physics, Java, English..."
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </div>
      </div>

      <div className="subject-filter-list" aria-label="Popular subjects">
        <button type="button" className={`subject-filter ${subject ? '' : 'subject-filter-active'}`} onClick={() => setSubject('')}>All subjects</button>
        {popularSubjects.map((topic) => (
          <button key={topic} type="button" className={`subject-filter ${subject.toLowerCase() === topic.toLowerCase() ? 'subject-filter-active' : ''}`} onClick={() => setSubject(topic)}>
            {topic}
          </button>
        ))}
      </div>

      {error ? (
        <FeedbackState type="error" title="Tutor search unavailable" description={error} action={<button type="button" className="btn btn-primary" onClick={() => setRefresh((current) => current + 1)}>Try again</button>} />
      ) : loading ? (
        <FeedbackState type="loading" layout="cards" title="Finding tutors" description="Searching for tutors that match your interests." />
      ) : tutors.length ? (
        <div className="tutor-grid">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="tutor-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <TutorPortrait id={tutor.id} name={tutor.name} className="avatar tutor-card-portrait" />
                <div>
                  <h3 style={{ margin: 0 }}>{tutor.name}</h3>
                  <div className="muted-label"><GraduationCap size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Tutor profile</div>
                </div>
              </div>

              <p>{tutor.bio || 'Experienced tutor ready to help learners build confidence and achieve goals.'}</p>

              <div className="subject-badges">
                {(tutor.subjects || 'General support').split(',').slice(0, 3).map((tag) => (
                  <span key={tag}>{tag.trim()}</span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div>
                  <div className="muted-label">Starting at</div>
                  <strong className="tutor-price">{formatCurrency(tutor.hourlyRate)}</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <Link to={`/tutors/${tutor.id}`} className="btn btn-ghost">View profile</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <FeedbackState type="empty" title="No tutors found" description="No tutors match that subject yet. Try a broader keyword or clear the search." action={<button type="button" className="btn btn-secondary" onClick={() => setSubject('')}>Clear search</button>} />
      )}
    </div>
  );
}
