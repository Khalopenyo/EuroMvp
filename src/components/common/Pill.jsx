export function Pill({ tone, children }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}
