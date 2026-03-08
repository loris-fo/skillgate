import Link from "next/link";

const ShieldIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-accent"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const TerminalIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-accent"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 15l3-3-3-3" />
    <path d="M13 15h4" />
  </svg>
);

const BadgeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-accent"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
);

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

const features: FeatureCard[] = [
  {
    icon: <ShieldIcon />,
    title: "Security Audit",
    description:
      "AI analyzes 5 risk categories: hidden logic, data access, action risk, permission scope, and override attempts.",
    href: "/audit",
  },
  {
    icon: <TerminalIcon />,
    title: "CLI Gate",
    description:
      "Install the CLI to block risky skills before they run. One command between you and a bad install.",
    href: "https://www.npmjs.com/package/skillgate",
    external: true,
  },
  {
    icon: <BadgeIcon />,
    title: "Trust Badges",
    description:
      "Add verified badges to your README so others know your skill has been audited.",
    href: "#badge-section",
  },
];

function CardWrapper({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className =
    "block rounded-xl bg-surface-card border border-border-card shadow-card p-6 transition-colors hover:border-border-card-hover";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="mb-8 text-center text-2xl font-bold text-text-heading">
        What Skillgate checks
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {features.map((feature) => (
          <CardWrapper
            key={feature.title}
            href={feature.href}
            external={feature.external}
          >
            <div className="mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-text-heading">{feature.title}</h3>
            <p className="mt-2 text-sm text-text-body">{feature.description}</p>
          </CardWrapper>
        ))}
      </div>
    </section>
  );
}
