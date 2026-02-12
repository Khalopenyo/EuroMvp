export function Segmented({ value, onChange, options }) {
  return (
    <div className="segmented" role="tablist" aria-label="Выбор">
      {options.map((option) => (
        <button
          key={option.value}
          className={`segmented__item ${value === option.value ? "isActive" : ""}`}
          onClick={() => onChange(option.value)}
          role="tab"
          aria-selected={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
