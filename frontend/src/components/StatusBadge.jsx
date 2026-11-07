const statusClassNames = {
  PENDING: 'status-pending',
  CONFIRMED: 'status-confirmed',
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
