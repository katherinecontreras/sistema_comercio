import * as React from 'react';
import { Link } from 'react-router-dom';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  isOpen: boolean;
  isActive: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export const NavLink = React.memo(({ 
  href, 
  icon: Icon, 
  text, 
  isOpen, 
  isActive,
  disabled = false,
  disabledReason,
}: NavLinkProps) => {
  const baseClasses = `flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group`;
  const stateClasses = disabled
    ? 'text-slate-500 cursor-not-allowed opacity-60'
    : isActive
      ? 'bg-slate-700 text-slate-100'
      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100';
  const linkClasses = `${baseClasses} ${stateClasses}`;

  if (!isOpen) {
    return (
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          {disabled ? (
            <div className={linkClasses}>
              <Icon className="w-5 h-5 mx-auto" />
            </div>
          ) : (
            <Link to={href} className={linkClasses}>
              <Icon className="w-5 h-5 mx-auto" />
            </Link>
          )}
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="center"
          className="px-3 py-1.5 text-sm"
        >
          <span className="block font-medium">{text}</span>
          {disabled && disabledReason && (
            <span className="text-xs text-slate-400">{disabledReason}</span>
          )}
        </HoverCardContent>
      </HoverCard>
    );
  }

  if (disabled) {
    return (
      <div className={linkClasses}>
        <Icon className="w-5 h-5" />
        <span className="ml-3 whitespace-nowrap">{text}</span>
      </div>
    );
  }

  return (
    <Link to={href} className={linkClasses}>
      <Icon className="w-5 h-5" />
      <span className="ml-3 whitespace-nowrap">{text}</span>
    </Link>
  );
});

NavLink.displayName = 'NavLink';
