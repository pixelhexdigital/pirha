import { ChefHat, LayoutGrid, ReceiptText } from "lucide-react";

import Wordmark from "components/Wordmark";

const CAPABILITIES = [
  {
    icon: LayoutGrid,
    title: "Tables & QR ordering",
    desc: "Seat guests and take QR orders in seconds.",
  },
  {
    icon: ChefHat,
    title: "Live kitchen & orders",
    desc: "Tickets flow to the kitchen in real time.",
  },
  {
    icon: ReceiptText,
    title: "Billing & insights",
    desc: "Close checks and see the day at a glance.",
  },
];

// Brand-first hero shown beside the auth form on large screens. Drenched in the
// deep-indigo brand anchor, warmed by a single magenta glow (magenta stays
// atmosphere here, never a false action color).
const AuthHero = () => {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 bg-secondary">
      {/* Atmospheric magenta glow — warmth without spraying the accent. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-[28rem] rounded-full bg-primary/30 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 size-[24rem] rounded-full bg-primary/20 blur-[120px]"
      />
      {/* Faint dot grid for texture. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
        <Wordmark className="text-2xl text-primary-foreground" />

        <div className="max-w-md">
          <h2 className="text-4xl font-bold tracking-tight xl:text-5xl text-primary-foreground text-balance">
            Run your entire restaurant from one simple system.
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/70 text-pretty">
            Front-of-house to kitchen — Pirha keeps service moving.
          </p>

          <ul className="mt-10 space-y-5">
            {CAPABILITIES.map(({ icon: Icon, title, desc }, i) => (
              <li
                key={title}
                style={{ animationDelay: `${150 + i * 90}ms` }}
                className="flex items-start gap-4 duration-500 ease-out animate-in fade-in slide-in-from-bottom-2 fill-mode-both motion-reduce:animate-none"
              >
                <span className="flex items-center justify-center border rounded-lg size-10 shrink-0 bg-primary-foreground/10 border-primary-foreground/15">
                  <Icon className="size-5 text-primary-foreground" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium text-primary-foreground">{title}</p>
                  <p className="text-sm text-primary-foreground/60">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-primary-foreground/50">
          &copy; {new Date().getFullYear()} Pirha. Built for busy service.
        </p>
      </div>
    </div>
  );
};

export default AuthHero;
