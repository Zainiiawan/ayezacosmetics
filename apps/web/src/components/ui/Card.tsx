import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card = ({ className, variant = 'default', children, ...props }: CardProps) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-luxury',
    outlined: 'bg-white border-2 border-rose-gold',
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 border-b border-gray-100', className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 border-t border-gray-100 bg-gray-50', className)} {...props}>
    {children}
  </div>
);

export default Card;