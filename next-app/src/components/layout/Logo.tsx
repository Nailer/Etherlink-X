import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect width="40" height="40" rx="8" fill="currentColor" className="text-primary" />
      <path
        d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30C25.5228 30 30 25.5228 30 20C30 14.4772 25.5228 10 20 10ZM15 16.5C15 15.6716 15.6716 15 16.5 15H23.5C24.3284 15 25 15.6716 25 16.5V23.5C25 24.3284 24.3284 25 23.5 25H16.5C15.6716 25 15 24.3284 15 23.5V16.5Z"
        fill="white"
      />
      <path
        d="M18 18C18 17.4477 18.4477 17 19 17H21C21.5523 17 22 17.4477 22 18V22C22 22.5523 21.5523 23 21 23H19C18.4477 23 18 22.5523 18 22V18Z"
        fill="currentColor"
        className="text-background"
      />
    </svg>
  );
}
