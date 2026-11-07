import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const nextErrors = {};
    if (!form.email) nextErrors.email = 'Email is required';
    if (!form.password) nextErrors.password = 'Password is required';
    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setApiError('');
    try {
      const data = await login(form);
      navigate(data.role === 'TUTOR' ? '/dashboard' : '/dashboard');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container auth-layout">
      <div className="auth-promo">
        <span className="eyebrow"><Sparkles size={14} /> Your next chapter starts here</span>
        <h1>Make learning click.</h1>
        <p>Meet the right tutor, find your rhythm, and keep moving toward the things you want to achieve.</p>
        <div className="auth-promo-points">
          <span><span className="auth-check">✓</span> Learn with expert tutors</span>
          <span><span className="auth-check">✓</span> Keep sessions and resources together</span>
        </div>
      </div>

      <div className="form-card auth-card">
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="eyebrow">Welcome back</div>
          <h2 className="page-heading" style={{ margin: '0.8rem 0 0.35rem', fontSize: '2rem' }}>Sign in to TechieTutor</h2>
          <p className="auth-subtitle">Pick up where your learning left off.</p>
        </div>

        {apiError && <div className="alert alert-error page-alert" role="alert">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
            {errors.email && <small id="email-error" className="field-error">{errors.email}</small>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="password-wrap">
              <input className="input" id="password" name="password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <small id="password-error" className="field-error">{errors.password}</small>}
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? <><Loader2 size={16} className="loading-dots" /> Signing in...</> : <>Sign in <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center', color: '#475569' }}>
          New to TechieTutor? <Link to="/register" className="text-link">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
