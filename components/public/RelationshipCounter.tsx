function difference(startValue: string, endValue: string) {
  const start = new Date(startValue + "T00:00:00Z");
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime())) return { years: 0, months: 0, days: 0, totalDays: 0 };
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();
  let days = end.getUTCDate() - start.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86_400_000));
  return { years: Math.max(0, years), months, days, totalDays };
}

export function RelationshipCounter({
  startDate,
  now,
  compact = false,
}: {
  startDate: string;
  now: string;
  compact?: boolean;
}) {
  const duration = difference(startDate, now);
  if (compact) return <span>{duration.totalDays.toLocaleString("en")} days together</span>;
  const label = duration.years + " years, " + duration.months + " months, and " + duration.days + " days together";
  return (
    <div className="relationship-counter" aria-label={label}>
      <div><strong>{duration.years}</strong><span>years</span></div>
      <i />
      <div><strong>{duration.months}</strong><span>months</span></div>
      <i />
      <div><strong>{duration.days}</strong><span>days</span></div>
      <p>and counting, together.</p>
    </div>
  );
}
