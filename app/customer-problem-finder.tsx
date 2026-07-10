"use client";

import Link from "next/link";

declare global {
  interface Window {
    _hsq?: Array<unknown>;
  }
}

type ProblemOption = {
  label: string;
  icon: "speed" | "laptop" | "virus" | "phone" | "wifi" | "device" | "web" | "growth" | "automation" | "help";
  href: string;
  analyticsEvent: string;
};

const options: ProblemOption[] = [
  {
    label: "My Computer Is Slow",
    icon: "speed",
    href: "/free-estimate?serviceType=computer-repair&problem=slow-computer",
    analyticsEvent: "problem_finder_slow_computer",
  },
  {
    label: "My Laptop Won't Turn On",
    icon: "laptop",
    href: "/free-estimate?serviceType=laptop-repair&problem=laptop-wont-turn-on",
    analyticsEvent: "problem_finder_laptop_power",
  },
  {
    label: "I Think I Have a Virus",
    icon: "virus",
    href: "/free-estimate?serviceType=virus-removal&problem=virus-signs",
    analyticsEvent: "problem_finder_virus",
  },
  {
    label: "My Phone Isn't Working Right",
    icon: "phone",
    href: "/free-estimate?serviceType=phone-troubleshooting&problem=phone-troubleshooting",
    analyticsEvent: "problem_finder_phone",
  },
  {
    label: "My Wi-Fi Keeps Disconnecting",
    icon: "wifi",
    href: "/free-estimate?serviceType=wifi-setup&problem=wifi-disconnecting",
    analyticsEvent: "problem_finder_wifi",
  },
  {
    label: "I Need Help Setting Up a Device",
    icon: "device",
    href: "/free-estimate?serviceType=device-setup&problem=device-setup",
    analyticsEvent: "problem_finder_device_setup",
  },
  {
    label: "I Need a Website",
    icon: "web",
    href: "/free-estimate?serviceType=website-development&problem=need-website",
    analyticsEvent: "problem_finder_website",
  },
  {
    label: "I Want More Customers Online",
    icon: "growth",
    href: "/services/seo-optimization",
    analyticsEvent: "problem_finder_more_customers_online",
  },
  {
    label: "I Want to Automate My Business",
    icon: "automation",
    href: "/free-estimate?serviceType=business-automation&problem=business-automation",
    analyticsEvent: "problem_finder_business_automation",
  },
];

function ProblemIcon({ kind }: { kind: ProblemOption["icon"] }) {
  if (kind === "speed") {
    return (
      <svg viewBox="0 0 24 24" className="problem-svg" aria-hidden="true">
        <path d="M4 13a8 8 0 1116 0" />
        <path d="M12 13l4-4" />
        <path d="M7 16h10" />
      </svg>
    );
  }

  if (kind === "laptop") {
    return (
      <svg viewBox="0 0 24 24" className="problem-svg" aria-hidden="true">
        <rect x="4" y="6" width="16" height="10" rx="1.5" />
        <path d="M2.5 18h19" />
      </svg>
    );
  }

  if (kind === "virus") {
    return (
      <svg viewBox="0 0 24 24" className="problem-svg" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
      </svg>
    );
  }

  if (kind === "phone") {
    return (
      <svg viewBox="0 0 24 24" className="problem-svg" aria-hidden="true">
        <rect x="8" y="3" width="8" height="18" rx="2" />
        <path d="M11 18h2" />
      </svg>
    );
  }

  if (kind === "wifi") {
    return (
      <svg viewBox="0 0 24 24" className="problem-svg" aria-hidden="true">
        <path d="M4 9a12 12 0 0116 0" />
        <path d="M7 12a8 8 0 0110 0" />
        <path d="M10 15a4 4 0 014 0" />
        <circle cx="12" cy="18" r="1" />
      </svg>
    );
  }

  if (kind === "device") {
    return (
      <svg viewBox="0 0 24 24" className="problem-svg" aria-hidden="true">
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        <circle cx="12" cy="12" r="5" />
      </svg>
    );
  }

  if (kind === "web") {
    return (
      <svg viewBox="0 0 24 24" className="problem-svg" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
      </svg>
    );
  }

  if (kind === "growth") {
    return (
      <svg viewBox="0 0 24 24" className="problem-svg" aria-hidden="true">
        <path d="M4 18h16" />
        <path d="M6 15l4-4 3 3 5-6" />
        <path d="M17 8h2v2" />
      </svg>
    );
  }

  if (kind === "automation") {
    return (
      <svg viewBox="0 0 24 24" className="problem-svg" aria-hidden="true">
        <rect x="7" y="7" width="10" height="10" rx="2" />
        <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="problem-svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 115 0c0 2-2.5 2-2.5 4" />
      <circle cx="12" cy="17.5" r="1" />
    </svg>
  );
}

export default function CustomerProblemFinder() {

  function track(eventName: string) {
    window._hsq?.push([
      "trackCustomBehavioralEvent",
      {
        name: eventName,
      },
    ]);
  }

  return (
    <section className="problem-finder-section rounded-3xl p-6 md:p-8" id="problem-finder">
      <h2 className="section-title">What&apos;s Going On Today?</h2>
      <p className="section-copy mt-3">
        You do not need to know the technical name of the problem. Just choose what sounds closest
        and we will help you figure it out.
      </p>

      <div className="problem-finder-grid mt-5">
        {options.map((option) => (
          <Link
            key={option.label}
            href={option.href}
            className="problem-option"
            onClick={() => track(option.analyticsEvent)}
          >
            <span className="problem-option-icon" aria-hidden="true">
              <ProblemIcon kind={option.icon} />
            </span>
            <span>{option.label}</span>
          </Link>
        ))}

        <Link
          href="/diagnostic"
          className="problem-option"
          onClick={() => track("problem_finder_not_sure")}
        >
          <span className="problem-option-icon" aria-hidden="true">
            <ProblemIcon kind="help" />
          </span>
          <span>I&apos;m Not Sure What&apos;s Wrong</span>
        </Link>
      </div>

      <p className="mt-5 text-center text-base text-blue-200">
        <Link href="/diagnostic" className="problem-diagnostic-link" onClick={() => track("problem_finder_not_sure")}>
          Not sure what&apos;s wrong? Start a quick diagnostic
        </Link>
      </p>
    </section>
  );
}
