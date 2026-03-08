export default function Button({ children, onClick, disabled = false, className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg bg-neutral-900 px-6 py-2 font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}