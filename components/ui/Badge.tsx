import { getStatusColor } from '@/lib/utils'

interface BadgeProps {
  status: string
  className?: string
}

export function Badge({ status, className = '' }: BadgeProps) {
  const colorClasses = getStatusColor(status)

  return (
    <span className={`inline-block px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${colorClasses} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

interface CustomBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const variantColors = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
}

export function CustomBadge({ children, variant = 'default', className = '' }: CustomBadgeProps) {
  return (
    <span className={`inline-block px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium ${variantColors[variant]} ${className}`}>
      {children}
    </span>
  )
}
