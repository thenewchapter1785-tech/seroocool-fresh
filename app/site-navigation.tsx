import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/services/computer-repair", label: "Computer Repair" },
  { href: "/services/remote-tech-support", label: "Tech Support" },
  { href: "/services", label: "Business Services" },
  { href: "/plans", label: "Pricing & Plans" },
  { href: "/about", label: "About" },
  { href: "/#contact", label: "Contact" },
  { href: "/estimate", label: "Free Estimate", primary: true },
];

export default function SiteNavigation() {
  return (
    <header className="site-nav-wrap">
      <nav className="site-nav" aria-label="Primary">
        <Link href="/" className="site-nav-brand">
          ZeroCool Development
        </Link>
        <div className="site-nav-links">
          {links.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={link.primary ? "site-nav-link site-nav-link-primary" : "site-nav-link"}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
