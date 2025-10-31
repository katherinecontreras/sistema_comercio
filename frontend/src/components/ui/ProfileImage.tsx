import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileImageProps {
  user?: {
    nombre?: string;
    apellido?: string;
    dni?: string | null;
  } | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ user, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const initials = user?.nombre && user?.apellido
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    : user?.dni
    ? user.dni.slice(-2)
    : 'U';

  return (
    <div
      className={cn(
        'rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-medium',
        sizeClasses[size],
        className
      )}
    >
      {user ? (
        <span className="text-xs">{initials}</span>
      ) : (
        <User className="h-4 w-4" />
      )}
    </div>
  );
};

export default ProfileImage;

