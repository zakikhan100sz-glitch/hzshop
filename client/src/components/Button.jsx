export default function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition active:scale-[0.99]';
  const styles = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800',
    secondary: 'bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50',
    ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100'
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
