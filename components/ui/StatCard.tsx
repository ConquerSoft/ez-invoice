import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | ReactNode
  subtitle?: string
  icon?: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

const variantClasses = {
  default: 'text-gray-900',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
}

const iconBgClasses = {
  default: 'bg-gray-100',
  success: 'bg-green-100',
  warning: 'bg-yellow-100',
  danger: 'bg-red-100',
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  variant = 'default',
  className = '',
}: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 transition-shadow duration-200 hover:shadow-md ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide mb-1.5 md:mb-2">
            {label}
          </p>
          <p className={`text-2xl md:text-3xl font-bold ${variantClasses[variant]} mb-1`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs md:text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`${iconBgClasses[variant]} rounded-lg p-2 md:p-3 ml-2 md:ml-4`}>
            <div className="text-gray-600">{icon}</div>
          </div>
        )}
      </div>
    </div>
  )
}
