export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="empty">
      <div className="empty__title">{title}</div>
      {subtitle && <div className="empty__sub">{subtitle}</div>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}
