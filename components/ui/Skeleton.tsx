import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

export function Skeleton({
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={[
        'animate-pulse rounded-md bg-gray-200',
        className,
      ].join(' ')}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}
