"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="status-page">
      <span>!</span>
      <p className="eyebrow">A page slipped out of the album</p>
      <h1>We could not open this memory right now.</h1>
      <button className="button primary" type="button" onClick={reset}>Try again</button>
    </main>
  );
}
