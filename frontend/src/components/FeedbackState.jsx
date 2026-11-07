import { AlertCircle, Loader2, SearchX } from 'lucide-react';

const stateIcons = {
  loading: Loader2,
  error: AlertCircle,
  empty: SearchX,
};

export default function FeedbackState({ type = 'empty', title, description, action, layout = 'basic' }) {
  const Icon = stateIcons[type] || SearchX;

  return (
    <div className={`state-box state-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon className={`state-icon ${type === 'loading' ? 'loading-dots' : ''}`} size={25} aria-hidden="true" />
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {type === 'loading' && <SkeletonLayout layout={layout} />}
      {action}
    </div>
  );
}

function SkeletonLayout({ layout }) {
  if (layout === 'dashboard') {
    return (
      <div className="skeleton-dashboard" aria-hidden="true">
        <div className="skeleton-metrics">{[1, 2, 3, 4].map((item) => <span key={item} />)}</div>
        <div className="skeleton-panels">{[1, 2].map((item) => <span key={item} />)}</div>
      </div>
    );
  }

  if (layout === 'cards' || layout === 'profile') {
    return <div className={`skeleton-cards skeleton-cards-${layout}`} aria-hidden="true">{[1, 2, 3].map((item) => <span key={item} />)}</div>;
  }

  return (
    <div className="state-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}
