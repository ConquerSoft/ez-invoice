import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function generateInvoiceNumber(count: number): string {
  return `INV-${String(count + 1).padStart(4, '0')}`
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'paid') return false
  return new Date(dueDate) < new Date()
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800'
    case 'sent': return 'bg-blue-100 text-blue-800'
    case 'overdue': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
