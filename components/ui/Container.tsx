import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  full: 'w-full',
}

export function Container({
  children,
  className = '',
  maxWidth = 'lg',
}: ContainerProps) {
  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 md:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${className}`}>
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600 text-sm md:text-base mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex gap-2 md:gap-3">{action}</div>}
    </div>
  )
}
