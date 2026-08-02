import Link from "next/link";

export function PublicFooter({ personOne, personTwo }: { personOne: string; personTwo: string }) {
  return (
    <footer className="public-footer">
      <div>
        <p className="serif">{personOne} <em>&</em> {personTwo}</p>
        <span>A story still being written.</span>
      </div>
      <nav aria-label="Footer navigation">
        <Link href="/journey">Journey</Link>
        <Link href="/gallery">Gallery</Link>
        <Link href="/admin/login">Archive</Link>
        <Link href="/about">About</Link>
      </nav>
      <div className="footer-meta">
        <span>Made with care · {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
