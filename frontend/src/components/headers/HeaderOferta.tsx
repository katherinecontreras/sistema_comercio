import React from 'react';
import { LucideIcon, FileText } from 'lucide-react';

import { cn } from '@/lib/utils';

interface HeaderOfertaProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconBackgroundClassName?: string;
  rightContent?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const HeaderOferta: React.FC<HeaderOfertaProps> = ({
  title,
  subtitle,
  icon,
  iconBackgroundClassName,
  rightContent,
  className,
  children,
}) => {
  const IconComponent = icon ?? FileText;

  return (
    <div
      className={cn(
        'relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 py-5 mb-6',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-900/40',
            iconBackgroundClassName
          )}
        >
          <IconComponent className="h-6 w-6" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          {children && <div className="mt-3 text-sm text-slate-300">{children}</div>}
        </div>
      </div>

      {rightContent && (
        <div className="flex items-center gap-3">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default HeaderOferta;


