import * as React from 'react';
import { Link } from 'react-router-dom';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  isOpen: boolean;
  isActive: boolean;
}

export const NavLink = React.memo(({ 
  href, 
  icon: Icon, 
  text, 
  isOpen, 
  isActive 
}: NavLinkProps) => {
  const linkClasses = `flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
    isActive
      ? "bg-slate-700 text-slate-100"
      : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
  }`;

  if (!isOpen) {
    return (
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Link to={href} className={linkClasses}>
            <Icon className="w-5 h-5 mx-auto" />
          </Link>
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="center"
          className="px-3 py-1.5 text-sm"
        >
          {text}
        </HoverCardContent>
      </HoverCard>
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
