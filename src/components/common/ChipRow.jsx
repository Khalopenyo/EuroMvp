export function ChipRow({ items, activeId, onClick, variant = "default" }) {
  const isCategory = variant === "category";

  return (
    <div className={`chipRow ${isCategory ? "chipRow--category" : ""}`}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`chip ${isCategory ? "chip--category" : ""} ${activeId === item.id ? "isActive" : ""}`}
          onClick={() => onClick(item.id)}
        >
          {isCategory ? (
            <>
              <span className="chip__icon" aria-hidden>
                {item.icon || "•"}
              </span>
              <span className="chip__body">
                <span className="chip__name">{item.name}</span>
                {item.caption && <span className="chip__meta">{item.caption}</span>}
              </span>
            </>
          ) : (
            item.name
          )}
        </button>
      ))}
    </div>
  );
}
