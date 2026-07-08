"use client";

declare global {
  interface Window {
    _hsq?: Array<unknown>;
  }
}

type TrackedLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  eventName: string;
  target?: "_blank" | "_self";
  rel?: string;
};

export default function TrackedLink({
  href,
  className,
  children,
  eventName,
  target,
  rel,
}: TrackedLinkProps) {
  function handleClick() {
    window._hsq?.push([
      "trackCustomBehavioralEvent",
      {
        name: eventName,
      },
    ]);
  }

  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
