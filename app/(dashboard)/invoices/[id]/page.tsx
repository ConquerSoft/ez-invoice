import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils'
import type { Invoice } from '@/types'
import { Container, PageHeader, Card, CardBody, Badge, Button } from '@/components/ui'
import { ArrowLeft, Send, Trash2, ExternalLink } from 'lucide-react'

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: inv } = await supabase
    .from('invoices').select('*').eq('id', params.id).eq('user_id', user!.id).single()

  if (!inv) notFound()

  const invoice: Invoice = {
    ...inv,
    status: inv.status !== 'paid' && isOverdue(inv.due_date, inv.status) ? 'overdue' : inv.status,
  }

  const handleSend = async () => {
    'use server'
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/invoices/${params.id}/send`, { method: 'POST' })
    redirect(`/invoices/${params.id}`)
  }

  const handleDelete = async () => {
    'use server'
    const supabase = createClient()
    await supabase.from('invoices').delete().eq('id', params.id)
    redirect('/invoices')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Container maxWidth="xl">
        {/* Header with Navigation */}
        <div className="mb-6 md:mb-8">
          <Link href="/invoices" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-4 transition-colors">
            <ArrowLeft size={18} /> Back to Invoices
          </Link>
          <PageHeader
            title={invoice.invoice_number}
            subtitle={`Status: ${invoice.status}`}
            action={<Badge status={invoice.status} />}
          />
        </div>

        {/* Action Buttons - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          {invoice.status === 'draft' && (
            <form action={handleSend} className="sm:col-span-1">
              <Button type="submit" variant="primary" fullWidth className="min-h-12">
                <Send size={18} className="mr-2 inline" /> Send Invoice
              </Button>
            </form>
          )}
          {invoice.stripe_payment_link && (
            <a href={invoice.stripe_payment_link} target="_blank" rel="noopener noreferrer" className="sm:col-span-1">
              <Button variant="secondary" fullWidth className="min-h-12 justify-center">
                <ExternalLink size={18} className="mr-2" /> Payment Link
              </Button>
            </a>
          )}
          <form action={handleDelete} className="sm:col-span-1">
            <Button type="submit" variant="danger" fullWidth className="min-h-12">
              <Trash2 size={18} className="mr-2 inline" /> Delete
            </Button>
          </form>
        </div>

        {/* Invoice Card */}
        <Card className="overflow-hidden mb-6 md:mb-8">
          {/* Invoice Header */}
          <div className="bg-black text-white p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-green-400">EZ Invoice</h2>
                <p className="text-gray-400 text-sm mt-1">{invoice.invoice_number}</p>
              </div>
              <div className="text-sm md:text-base">
                <p className="text-gray-400">
                  <span className="block md:inline">Issue Date: </span>
                  <span className="text-white font-medium">{formatDate(invoice.issue_date)}</span>
                </p>
                <p className="text-gray-400 mt-2 md:mt-0 md:ml-6">
                  <span className="block md:inline">Due Date: </span>
                  <span className="text-white font-medium">{formatDate(invoice.due_date)}</span>
                </p>
                {invoice.paid_at && (
                  <p className="text-green-400 mt-2 md:mt-0 md:ml-6">
                    <span className="block md:inline">Paid: </span>
                    <span className="font-medium">{formatDate(invoice.paid_at)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Content */}
          <CardBody className="space-y-6 md:space-y-8">
            {/* Bill To */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
              <p className="font-semibold text-gray-900 text-lg">{invoice.client_name}</p>
              {invoice.client_email && <p className="text-gray-600 text-sm mt-1">{invoice.client_email}</p>}
              {invoice.client_address && <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">{invoice.client_address}</p>}
            </div>

            {/* Line Items */}
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full text-sm md:text-base">
                <thead className="border-b-2 border-gray-900">
                  <tr className="text-gray-700">
                    <th className="px-4 md:px-0 py-3 md:py-4 text-left font-semibold">Description</th>
                    <th className="px-4 md:px-0 py-3 md:py-4 text-right font-semibold w-16 md:w-20">Qty</th>
                    <th className="px-4 md:px-0 py-3 md:py-4 text-right font-semibold w-24 md:w-32">Unit Price</th>
                    <th className="px-4 md:px-0 py-3 md:py-4 text-right font-semibold w-24 md:w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.line_items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 md:px-0 py-3 md:py-4 text-gray-900">{item.description}</td>
                      <td className="px-4 md:px-0 py-3 md:py-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-4 md:px-0 py-3 md:py-4 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 md:px-0 py-3 md:py-4 text-right font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-2 text-sm md:text-base">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.tax_rate > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({invoice.tax_rate}%)</span>
                    <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base md:text-lg border-t border-gray-200 pt-3 md:pt-4">
                  <span className="text-gray-900">Total Due</span>
                  <span className="text-green-600">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-gray-600 text-sm md:text-base whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Payment CTA */}
        {invoice.stripe_payment_link && invoice.status !== 'paid' && (
          <Card className="bg-green-50 border-green-200">
            <CardBody className="py-6 md:py-8 text-center">
              <h3 className="font-semibold text-gray-900 mb-2 md:mb-4 text-lg">Payment Required</h3>
              <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Share this link with your client to collect payment</p>
              <a href={invoice.stripe_payment_link} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg" fullWidth>
                  <ExternalLink size={18} className="mr-2 inline" /> Pay Now — {formatCurrency(invoice.total)}
                </Button>
              </a>
            </CardBody>
          </Card>
        )}
      </Container>
    </div>
  )
}
