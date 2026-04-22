'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, FileText, LogOut, PlusCircle, Menu, X } from 'lucide-react'
import { useState, ReactNode } from 'react'

interface DashboardLayoutClientProps {
  children: ReactNode
  userEmail: string
}

export default function DashboardLayoutClient({ children, userEmail }: DashboardLayoutClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/invoices', label: 'Invoices', icon: FileText },
  ]

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-black text-white border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-green-400">EZ Invoice</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors min-h-10 min-w-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-[56px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative top-[56px] md:top-0 left-0 h-[calc(100vh-56px)] md:h-screen
          w-64 bg-black text-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          z-40 md:z-0
          overflow-y-auto
        `}
      >
        {/* Logo - Desktop only */}
        <div className="hidden md:block p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-green-400">EZ Invoice</h1>
          <p className="text-gray-400 text-xs mt-1 truncate">{userEmail}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 md:p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200 min-h-12 md:min-h-auto"
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
          <Link
            href="/invoices/new"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 mt-2 md:mt-4 min-h-12 md:min-h-auto font-medium"
          >
            <PlusCircle size={18} />
            <span>New Invoice</span>
          </Link>
        </nav>

        {/* Sign Out */}
        <div className="p-3 md:p-4 border-t border-gray-800">
          <button
            onClick={() => {
              setSidebarOpen(false)
              handleSignOut()
            }}
            className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 w-full text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200 min-h-12 md:min-h-auto font-medium"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  )
}
