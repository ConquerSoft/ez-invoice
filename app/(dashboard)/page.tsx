import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils'
import type { Invoice } from '@/types'
import { PageHeader, Container, StatCard, Card, CardHeader, CardBody, Badge, Button } from '@/components/ui'
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const allInvoices: Invoice[] = (invoices || []).map((inv: Invoice) => ({
    ...inv,
    status: inv.status !== 'paid' && isOverdue(inv.due_date, inv.status) ? 'overdue' : inv.status,
  }))

  const totalOutstanding = allInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0)
  const totalPaid = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const overdueCount = allInvoices.filter(i => i.status === 'overdue').length
  const sentCount = allInvoices.filter(i => i.status === 'sent').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Container maxWidth="xl">
        {/* Header */}
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back! Here's your invoice overview"
          action={
            <Link href="/invoices/new">
              <Button size="md">+ New Invoice</Button>
            </Link>
          }
        />

        {/* Stats Grid - Responsive 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatCard
            label="Outstanding"
            value={formatCurrency(totalOutstanding)}
            subtitle={`${sentCount} invoice${sentCount !== 1 ? 's' : ''} awaiting payment`}
            icon={<TrendingUp size={20} />}
            variant="default"
          />
          <StatCard
            label="Paid"
            value={formatCurrency(totalPaid)}
            subtitle={`${allInvoices.filter(i => i.status === 'paid').length} invoice${allInvoices.filter(i => i.status === 'paid').length !== 1 ? 's' : ''}`}
            icon={<CheckCircle2 size={20} />}
            variant="success"
          />
          <StatCard
            label="Overdue"
            value={overdueCount}
            subtitle="Need attention"
            icon={<AlertCircle size={20} />}
            variant={overdueCount > 0 ? 'danger' : 'default'}
          />
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recent Invoices</h2>
          </CardHeader>
          <CardBody className="p-0">
            {allInvoices.length === 0 ? (
              <div className="px-4 md:px-6 py-12 md:py-16 text-center">
                <p className="text-gray-500 mb-4 text-base md:text-lg">No invoices yet</p>
                <p className="text-gray-400 mb-6 text-sm md:text-base">Create your first invoice to get started</p>
                <Link href="/invoices/new">
                  <Button>Create Your First Invoice</Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left">Invoice</th>
                        <th className="px-6 py-3 text-left">Client</th>
                        <th className="px-6 py-3 text-left">Due Date</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allInvoices.slice(0, 10).map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <Link href={`/invoices/${inv.id}`} className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                              {inv.invoice_number}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{inv.client_name}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(inv.due_date)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge status={inv.status} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link href={`/invoices/${inv.id}`}>
                              <button className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors">
                                View
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                  {allInvoices.slice(0, 10).map(inv => (
                    <Link key={inv.id} href={`/invoices/${inv.id}`}>
                      <div className="px-4 py-4 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{inv.invoice_number}</p>
                            <p className="text-sm text-gray-600">{inv.client_name}</p>
                          </div>
                          <Badge status={inv.status} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Due {formatDate(inv.due_date)}</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(inv.total)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>

        {/* View All Link */}
        {allInvoices.length > 10 && (
          <div className="mt-6 md:mt-8 text-center">
            <Link href="/invoices" className="text-green-600 hover:text-green-700 font-medium transition-colors">
              View All Invoices →
            </Link>
          </div>
        )}
      </Container>
    </div>
  )
}
