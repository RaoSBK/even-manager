import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyle = interactive ? 'luxury-card-interactive' : 'luxury-card';
  return (
    <div className={`${baseStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
