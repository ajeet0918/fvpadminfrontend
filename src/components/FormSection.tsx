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
        <div className="form-section-header">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="page-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
