export default function Button({ children, onClick, disabled = false, className = '', type = 'button', variant = 'primary', ...props }) {
  const baseClass = 'rounded-lg px-6 py-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClass = 
    variant === 'secondary' 
      ? 'border border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50'
      : 'bg-neutral-900 text-white hover:bg-neutral-800';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}