export default function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white">
      {children}
    </span>
  );
}
