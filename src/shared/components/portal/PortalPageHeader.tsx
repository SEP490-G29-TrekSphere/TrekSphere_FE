import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AppButton } from '@/shared/ui';

export interface PortalBreadcrumbItem {
  label: string;
  href?: string;
}

export interface PortalPageHeaderProps {
  title: string | ReactNode;
  description?: string | ReactNode;
  breadcrumbs?: PortalBreadcrumbItem[];
  backButton?: {
    to: string;
    label?: string;
  };
  actions?: ReactNode;
  className?: string;
}

export function PortalPageHeader({
  title,
  description,
  breadcrumbs,
  backButton,
  actions,
  className = '',
}: PortalPageHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
    >
      <div className="space-y-1.5 min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div key={item.label} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  {item.href && !isLast ? (
                    <Link to={item.href} className="hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-foreground font-semibold' : ''}>
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {backButton && (
            <Link to={backButton.to}>
              <AppButton
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl border-[#E5E4DE] text-zinc-700 hover:bg-zinc-100"
                aria-label={backButton.label || 'Quay lại'}
                title={backButton.label || 'Quay lại'}
              >
                <ArrowLeft className="h-4 w-4" />
              </AppButton>
            </Link>
          )}

          {typeof title === 'string' ? (
            <h1 className="text-2xl font-bold tracking-tight text-[#06261D] md:text-3xl truncate">
              {title}
            </h1>
          ) : (
            title
          )}
        </div>

        {description &&
          (typeof description === 'string' ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : (
            description
          ))}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 sm:self-center shrink-0">{actions}</div>
      )}
    </header>
  );
}
