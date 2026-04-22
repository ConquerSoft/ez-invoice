import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${hoverable ? 'transition-shadow duration-200 hover:shadow-md' : ''} ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-4 md:px-6 py-4 md:py-6 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  )
}

interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={`px-4 md:px-6 py-4 md:py-6 ${className}`}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex gap-2 md:gap-3 ${className}`}>
      {children}
    </div>
  )
}
