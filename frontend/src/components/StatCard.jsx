import React from 'react';
import '../styles/StatCard.css';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-info">
        <span className="stat-card-title">{title}</span>
        <h3 className="stat-card-value">{value}</h3>
        {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`stat-card-icon-box stat-icon-${color}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;

