import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "ghost";

const styles: Record<Variant, string> = {
  // primary = section accent; ghost = teal outline (DESIGN.md)
  primary:
    "bg-(--accent) text-(--accent-contrast) font-semibold hover:brightness-110 border border-transparent",
  ghost:
    "border border-teal text-teal hover:bg-teal/10",
};

const base =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-(--radius-sm) font-body text-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: { variant?: Variant } & ComponentProps<"button">) {
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  to,
  external = false,
  className = "",
  children,
}: {
  variant?: Variant;
  to: string;
  external?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noreferrer noopener"
        className={`${base} ${styles[variant]} ${className}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}
