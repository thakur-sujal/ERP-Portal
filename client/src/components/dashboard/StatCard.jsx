import './StatCard.css';

export default function StatCard({ title, value, icon: Icon, trend, color = 'primary' }) {
    return (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-icon-wrapper">
                <Icon size={24} />
            </div>
            <div className="stat-content">
                <span className="stat-title">{title}</span>
                <span className="stat-value">{value}</span>
                {trend && (
                    <span className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
        </div>
    );
}
