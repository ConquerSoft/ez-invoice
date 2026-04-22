import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils'
import type { Invoice } from '@/types'
import { Container, PageHeader, Card, CardBody, Badge, Button } from '@/components/ui'

export default async function InvoicesPage() {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Container maxWidth="xl">
        <PageHeader
          title="All Invoices"
          subtitle={`You have ${allInvoices.length} invoice${allInvoices.length !== 1 ? 's' : ''}`}
          action={
            <Link href="/invoices/new">
              <Button size="md">+ New Invoice</Button>
            </Link>
          }
        />

        <Card>
          <CardBody className="p-0">
            {allInvoices.length === 0 ? (
              <div className="px-4 md:px-6 py-12 md:py-16 text-center">
                <p className="text-gray-500 mb-4 text-base md:text-lg font-medium">No invoices yet</p>
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
                    <thead className="bg-gray-50 text-xs text-gray-600 uppercase font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left">Invoice</th>
                        <th className="px-6 py-3 text-left">Client</th>
                        <th className="px-6 py-3 text-left">Issued</th>
                        <th className="px-6 py-3 text-left">Due</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 font-semibold text-green-600">{inv.invoice_number}</td>
                          <td className="px-6 py-4 text-gray-700">{inv.client_name}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(inv.issue_date)}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(inv.due_date)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge status={inv.status} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link href={`/invoices/${inv.id}`} className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors">
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                  {allInvoices.map(inv => (
                    <Link key={inv.id} href={`/invoices/${inv.id}`}>
                      <div className="px-4 py-4 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{inv.invoice_number}</p>
                            <p className="text-sm text-gray-600">{inv.client_name}</p>
                          </div>
                          <Badge status={inv.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs md:text-sm text-gray-600">
                          <span>Due {formatDate(inv.due_date)}</span>
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
      </Container>
    </div>
  )
}
