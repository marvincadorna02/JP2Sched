export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-navy">{title}</h1>
        {subtitle && <p className="text-navy/75 text-sm mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5">{children}</div>}
    </div>
  );
}