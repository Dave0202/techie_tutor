import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') === 'TUTOR' ? 'TUTOR' : 'STUDENT',
  }));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const nextErrors = {};
    if (!form.name) nextErrors.name = 'Full name is required';
    if (!form.email) nextErrors.email = 'Email is required';
    if (!form.password || form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (!form.role) nextErrors.role = 'Role is required';
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
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      await register(payload);
      navigate('/dashboard');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container auth-layout">
      <div className="auth-promo">
        <span className="eyebrow"><Sparkles size={14} /> Technology • Education • Success</span>
        <h1>Learn boldly. Grow your way.</h1>
        <p>Create your free account to connect with tutors, explore learning resources, and make progress on your goals.</p>
        <div className="auth-promo-points">
          <span><span className="auth-check">✓</span> Choose a student or tutor account</span>
          <span><span className="auth-check">✓</span> Get started in just a few steps</span>
        </div>
      </div>

      <div className="form-card auth-card">
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="eyebrow">Create account</div>
          <h2 className="page-heading" style={{ margin: '0.8rem 0 0.35rem', fontSize: '2rem' }}>Join TechieTutor</h2>
          <p className="auth-subtitle">A little support can take you a long way.</p>
        </div>

        {apiError && <div className="alert alert-error page-alert" role="alert">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label" htmlFor="name">Full name</label>
            <input className="input" id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
            {errors.name && <small id="name-error" className="field-error">{errors.name}</small>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} />
            {errors.email && <small id="register-email-error" className="field-error">{errors.email}</small>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="role">Role</label>
            <select className="input" id="role" name="role" value={form.role} onChange={handleChange} aria-invalid={Boolean(errors.role)} aria-describedby={errors.role ? 'role-error' : undefined}>
              <option value="STUDENT">Student</option>
              <option value="TUTOR">Tutor</option>
            </select>
            {errors.role && <small id="role-error" className="field-error">{errors.role}</small>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="password-wrap">
              <input className="input" id="password" name="password" autoComplete="new-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <small id="register-password-error" className="field-error">{errors.password}</small>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="confirmPassword">Confirm password</label>
            <input className="input" id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined} />
            {errors.confirmPassword && <small id="confirm-password-error" className="field-error">{errors.confirmPassword}</small>}
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? <><Loader2 size={16} className="loading-dots" /> Creating account...</> : <>Create account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center', color: '#475569' }}>
          Already have an account? <Link to="/login" className="text-link">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
