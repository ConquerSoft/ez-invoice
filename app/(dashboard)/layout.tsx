import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardLayoutClient from './layout-client'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <DashboardLayoutClient userEmail={user.email || ''}>
      {children}
    </DashboardLayoutClient>
  )
}
