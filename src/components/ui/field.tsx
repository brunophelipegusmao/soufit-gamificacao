type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function Field({ label, htmlFor, error, children, className }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
