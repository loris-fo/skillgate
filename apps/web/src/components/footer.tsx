const links = [
  { label: "GitHub", href: "https://github.com/lorisfochesato/skillgate" },
  { label: "npm", href: "https://www.npmjs.com/package/skillgate" },
  { label: "skillgate.sh", href: "https://skillgate.sh" },
  {
    label: "MIT License",
    href: "https://github.com/lorisfochesato/skillgate/blob/main/LICENSE",
  },
];

export function Footer() {
  return (
    <footer className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-text-muted">
        {links.map((link, i) => (
          <span key={link.label}>
            {i > 0 && <span className="mx-2">&middot;</span>}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-body transition-colors"
            >
              {link.label}
            </a>
          </span>
        ))}
      </div>
    </footer>
  );
}
