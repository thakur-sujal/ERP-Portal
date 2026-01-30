import './Button.css';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon: Icon,
    ...props
}) {
    return (
        <button
            className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="btn-loader"></span>
            ) : Icon ? (
                <Icon size={size === 'sm' ? 16 : 18} />
            ) : null}
            {children}
        </button>
    );
}
