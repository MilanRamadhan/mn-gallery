import { Images } from "lucide-react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty-state">
      <Images aria-hidden="true" />
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
