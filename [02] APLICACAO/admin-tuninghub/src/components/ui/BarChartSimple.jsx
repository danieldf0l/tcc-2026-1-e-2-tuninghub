const BarChartSimple = ({ title, data, emptyLabel = 'Sem dados ainda.' }) => {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="panel-card">
      <h3 className="panel-title">{title}</h3>
      {data.length === 0 ? (
        <p className="empty-state">{emptyLabel}</p>
      ) : (
        <div className="bar-chart">
          {data.map((d) => (
            <div key={d.label} className="bar-chart-row">
              <span className="bar-chart-label">{d.label}</span>
              <div className="bar-chart-track">
                <div className="bar-chart-fill" style={{ width: `${(d.value / max) * 100}%` }} />
              </div>
              <span className="bar-chart-value">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BarChartSimple;