import type { JSX, ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}): JSX.Element {
  return (
    <header className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#6b6b66]">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="rounded-[10px] border border-dashed border-[#dcdcd6] bg-white px-6 py-12 text-center text-sm text-[#6b6b66]">
      {children}
    </div>
  );
}
