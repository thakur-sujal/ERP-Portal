import './Input.css';

export default function Input({
    label,
    error,
    icon: Icon,
    type = 'text',
    ...props
}) {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
                {Icon && <Icon className="input-icon" size={18} />}
                <input type={type} className="input-field" {...props} />
            </div>
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
}
