import Link from "next/link";

export default function NotFound() {
  return (
    <main className="status-page">
      <span>404</span>
      <p className="eyebrow">This page is not in the archive</p>
      <h1>Some stories are<br />still waiting to be written.</h1>
      <Link className="button primary" href="/">Return home</Link>
    </main>
  );
}
