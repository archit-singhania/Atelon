import type { HTMLAttributes, ReactNode } from 'react';

type Depth = 'thin' | 'regular' | 'dense';
interface Props extends HTMLAttributes<HTMLDivElement> { depth?: Depth; children: ReactNode; interactive?: boolean }

export function Glass({ depth = 'regular', interactive = false, className = '', children, ...props }: Props) {
  return <div className={`glass-v2 glass-${depth}${interactive ? ' glass-interactive' : ''} ${className}`} {...props}>{children}</div>;
}

export function Segmented({ options, value, onChange, label }: { options: { value: string; label: string }[]; value: string; onChange: (value: string) => void; label: string }) {
  return <div className="segmented glass-thin" role="group" aria-label={label}>{options.map((option) => <button type="button" aria-pressed={value === option.value} className={value === option.value ? 'active' : ''} key={option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}
