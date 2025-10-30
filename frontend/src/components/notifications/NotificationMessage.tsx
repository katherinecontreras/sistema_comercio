import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface NotificationMessageProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    details?: string[];
    className?: string;
}

const NotificationMessage: React.FC<NotificationMessageProps> = ({
    icon = <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto mb-4" />,
    title,
    subtitle,
    details = [],
    className = '',
}) => {
    return (
        <Card className={`bg-slate-800 border-slate-700 text-center py-8 ${className}`}>
            {icon} 
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            {subtitle && 
                <p className="text-slate-400 mb-4">{subtitle}</p>
            }
            {details.map((detail, i) => ( 
                <p key={i} className="text-slate-500 text-sm">{detail} </p>
            ))} 
        </Card>
    );
};

export default NotificationMessage;
