const StatCard = ({ label, value, hint }) => (
  <div className="stat-card">
    <span className="stat-card-value">{value}</span>
    <span className="stat-card-label">{label}</span>
    {hint && <span className="stat-card-hint">{hint}</span>}
  </div>
);

export default StatCard;