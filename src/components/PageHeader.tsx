import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  eyebrow?: string;
  context?: ReactNode;
};

export function PageHeader({ title, subtitle, actions, eyebrow, context }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow ? <span className="page-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="page-header-side">
        {context ? <div className="page-header-context">{context}</div> : null}
        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>
    </header>
  );
}
