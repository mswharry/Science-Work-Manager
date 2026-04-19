export default function FormField({ label, hint, error, required = false, children }) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {required ? <span className="field__required">*</span> : null}
      </span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
