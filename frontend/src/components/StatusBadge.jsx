const statusClassNames = {
  PENDING: 'status-pending',
  CONFIRMED: 'status-confirmed',
  IN_PROGRESS: 'status-in-progress',
  COMPLETED: 'status-completed',
  CANCELLED: 'status-cancelled',
};

export default function StatusBadge({ status }) {
  const normalizedStatus = status?.toUpperCase() || 'PENDING';

  return (
    <span className={`status-pill ${statusClassNames[normalizedStatus] || 'badge-primary'}`}>
      {normalizedStatus}
    </span>
  );
}
