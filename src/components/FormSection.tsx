import type { ReactNode } from "react";

type FormSectionProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function FormSection({ title, subtitle, actions, children, className }: FormSectionProps) {
  return (
    <section className={`form-section ${className ?? ""}`.trim()}>
      {(title || subtitle || actions) ? (
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? <h3 className="m-0 text-base font-semibold text-text-primary">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
          </div>
          {actions ? <div className="page-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
