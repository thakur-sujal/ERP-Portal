import './Card.css';

export default function Card({ children, className = '', title, action, ...props }) {
    return (
        <div className={`card glass-card ${className}`} {...props}>
            {(title || action) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {action}
                </div>
            )}
            <div className="card-content">{children}</div>
        </div>
    );
}
