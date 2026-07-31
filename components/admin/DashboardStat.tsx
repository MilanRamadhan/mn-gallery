import type { LucideIcon } from "lucide-react";

export function DashboardStat({ label, value, detail, icon: Icon }: { label: string; value: number; detail: string; icon: LucideIcon }) {
  return (
    <article className="dashboard-stat">
      <Icon size={18} />
      <p>{label}</p>
      <strong>{String(value).padStart(2, "0")}</strong>
      <span>{detail}</span>
    </article>
  );
}
