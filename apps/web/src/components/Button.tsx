import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "ghost";
/** Two shapes only (§5b): Block = flat accent fill + square end-cap holding ↗;
    Bracket = 1px outline, mono [ LABEL_TEXT ]. Zero radius, no pills. */

function blockClasses() {
  return "group inline-flex items-stretch t-label raise font-display font-semibold uppercase tracking-[0.08em] text-[13px]";
}

function BlockInner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="flex items-center px-5 py-3 bg-(--accent) text-(--accent-contrast)">{children}</span>
      <span className="flex items-center justify-center w-10 bg-(--accent) text-(--accent-contrast) border-l border-navy-900/25 transition-transform duration-200 group-hover:translate-x-1">
        ↗
      </span>
    </>
  );
}

function bracketClasses() {
  return "group inline-flex items-center gap-2 border border-(--accent) text-(--accent-ink) px-5 py-3 t-label raise transition-colors duration-200 hover:bg-(--accent)/10";
}

function toLabel(children: ReactNode): string {
  return String(children).toUpperCase().replace(/\s+/g, "_");
}

export function Button({ variant = "primary", className = "", children, ...props }: { variant?: Variant } & ComponentProps<"button">) {
  if (variant === "primary")
    return (
      <button className={`${blockClasses()} cursor-pointer disabled:opacity-50 ${className}`} {...props}>
        <BlockInner>{children}</BlockInner>
      </button>
    );
  return (
    <button className={`${bracketClasses()} cursor-pointer disabled:opacity-50 ${className}`} {...props}>
      <span className="transition-transform duration-200 group-hover:-translate-x-0.5">[</span>
      {toLabel(children)}
      <span className="transition-transform duration-200 group-hover:translate-x-0.5">]</span>
    </button>
  );
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
  const inner =
    variant === "primary" ? (
      <BlockInner>{children}</BlockInner>
    ) : (
      <>
        <span className="transition-transform duration-200 group-hover:-translate-x-0.5">[</span>
        {toLabel(children)}
        <span className="transition-transform duration-200 group-hover:translate-x-0.5">]</span>
      </>
    );
  const cls = `${variant === "primary" ? blockClasses() : bracketClasses()} ${className}`;
  if (external)
    return (
      <a href={to} target="_blank" rel="noreferrer noopener" className={cls}>
        {inner}
      </a>
    );
  return (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  );
}
