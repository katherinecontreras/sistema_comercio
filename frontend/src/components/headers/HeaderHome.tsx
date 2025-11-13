import React from 'react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface HeaderHomeProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}

const HeaderHome: React.FC<HeaderHomeProps> = ({
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
  aside,
}) => {
  return (
    <header className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        {Icon ? (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-900/40',
              iconClassName,
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
      {aside ? <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">{aside}</div> : null}
    </header>
  );
};

export default HeaderHome;



