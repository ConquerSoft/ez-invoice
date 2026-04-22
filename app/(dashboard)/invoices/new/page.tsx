'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { LineItem } from '@/types'
import { PlusCircle, Trash2, ChevronDown } from 'lucide-react'
import { Button, Input, TextArea, Card, CardBody, CardFooter, Container, PageHeader } from '@/components/ui'

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export default function NewInvoicePage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]
  })
  const [taxRate, setTaxRate] = useState(0)
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: generateId(), description: '', quantity: 1, unit_price: 0, amount: 0 }
  ])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    preview: true,
    client: true,
    items: true,
    totals: true,
    notes: true,
  })

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(items => items.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      updated.amount = updated.quantity * updated.unit_price
      return updated
    }))
  }

  const addLineItem = () => setLineItems(items => [
    ...items, { id: generateId(), description: '', quantity: 1, unit_price: 0, amount: 0 }
  ])

  const removeLineItem = (id: string) => setLineItems(items => items.filter(i => i.id !== id))

  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSave = async (status: 'draft' | 'sent') => {
    if (!clientName) {
      alert('Please enter a client name')
      return
    }
    if (status === 'sent' && !clientEmail) {
      alert('Please enter a client email to send the invoice')
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }

    // Get invoice count for number generation
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const invoiceNumber = `INV-${String((count || 0) + 1).padStart(4, '0')}`

    const { data: invoice, error } = await supabase.from('invoices').insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      client_name: clientName,
      client_email: clientEmail,
      client_address: clientAddress,
      issue_date: issueDate,
      due_date: dueDate,
      line_items: lineItems,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      notes,
      status: 'draft',
    }).select().single()

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    if (status === 'sent' && invoice) {
      await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' })
    }

    router.push(status === 'sent' ? '/invoices' : `/invoices/${invoice?.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Container maxWidth="lg">
        <PageHeader
          title="Create New Invoice"
          subtitle="Fill in the details below to create and send an invoice"
        />

        <div className="space-y-4 md:space-y-6">
          {/* Invoice Preview Card */}
          <Card>
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('preview')}>
              <h3 className="font-semibold text-gray-900">Invoice Preview</h3>
              <ChevronDown size={20} className={`transition-transform duration-300 ${expandedSections.preview ? 'transform rotate-180' : ''}`} />
            </div>
            {expandedSections.preview && (
              <CardBody className="bg-black text-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-green-400 font-bold text-lg md:text-xl">EZ Invoice</p>
                    <p className="text-gray-400 text-xs md:text-sm">Invoice #AUTO</p>
                  </div>
                  <div className="text-right text-gray-400 text-xs md:text-sm">
                    <p>Issue: {issueDate}</p>
                    <p>Due: {dueDate}</p>
                  </div>
                </div>
              </CardBody>
            )}
          </Card>

          {/* Client Information */}
          <Card>
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('client')}>
              <h3 className="font-semibold text-gray-900">Client Information</h3>
              <ChevronDown size={20} className={`transition-transform duration-300 ${expandedSections.client ? 'transform rotate-180' : ''}`} />
            </div>
            {expandedSections.client && (
              <CardBody className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 md:mb-4">Bill To</h4>
                    <div className="space-y-3 md:space-y-4">
                      <Input
                        label="Client Name"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        placeholder="Enter client name"
                        fullWidth
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        placeholder="client@example.com"
                        fullWidth
                      />
                      <TextArea
                        label="Address (Optional)"
                        value={clientAddress}
                        onChange={e => setClientAddress(e.target.value)}
                        placeholder="Street address, city, state, zip"
                        rows={3}
                        fullWidth
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 md:mb-4">Dates</h4>
                    <div className="space-y-3 md:space-y-4">
                      <Input
                        label="Issue Date"
                        type="date"
                        value={issueDate}
                        onChange={e => setIssueDate(e.target.value)}
                        fullWidth
                      />
                      <Input
                        label="Due Date"
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        fullWidth
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            )}
          </Card>

          {/* Line Items */}
          <Card>
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('items')}>
              <h3 className="font-semibold text-gray-900">Line Items</h3>
              <ChevronDown size={20} className={`transition-transform duration-300 ${expandedSections.items ? 'transform rotate-180' : ''}`} />
            </div>
            {expandedSections.items && (
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold">Description</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold w-16 md:w-20">Qty</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold w-24 md:w-32">Price</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold w-24 md:w-32">Amount</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lineItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-3 md:px-4 py-2 md:py-3">
                            <input
                              value={item.description}
                              onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                              placeholder="Description"
                              className="w-full focus:outline-none text-sm bg-transparent"
                            />
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full text-right focus:outline-none text-sm bg-transparent"
                              min="0"
                            />
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3">
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={e => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-full text-right focus:outline-none text-sm bg-transparent"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-right font-semibold text-gray-900">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3">
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              aria-label="Delete line item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 md:px-4 py-3 md:py-4 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={addLineItem}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors min-h-10"
                  >
                    <PlusCircle size={18} /> Add Line Item
                  </button>
                </div>
              </CardBody>
            )}
          </Card>

          {/* Totals */}
          <Card>
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('totals')}>
              <h3 className="font-semibold text-gray-900">Totals</h3>
              <ChevronDown size={20} className={`transition-transform duration-300 ${expandedSections.totals ? 'transform rotate-180' : ''}`} />
            </div>
            {expandedSections.totals && (
              <CardBody>
                <div className="space-y-3 md:space-y-4 max-w-xs md:max-w-sm ml-auto">
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm md:text-base">
                    <span className="text-gray-600">Tax Rate</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={taxRate}
                        onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                        className="w-16 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="100"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">Tax Amount</span>
                    <span className="font-medium text-gray-900">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-base md:text-lg font-bold border-t border-gray-200 pt-3 md:pt-4">
                    <span className="text-gray-900">Total</span>
                    <span className="text-green-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardBody>
            )}
          </Card>

          {/* Notes */}
          <Card>
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSection('notes')}>
              <h3 className="font-semibold text-gray-900">Notes</h3>
              <ChevronDown size={20} className={`transition-transform duration-300 ${expandedSections.notes ? 'transform rotate-180' : ''}`} />
            </div>
            {expandedSections.notes && (
              <CardBody>
                <TextArea
                  label="Notes (Optional)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Payment terms, thank you notes, or any other information..."
                  fullWidth
                />
              </CardBody>
            )}
          </Card>

          {/* Actions */}
          <Card>
            <CardFooter className="gap-3 flex-col sm:flex-row">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                disabled={saving || !clientName}
                onClick={() => handleSave('draft')}
              >
                Save Draft
              </Button>
              <Button
                size="md"
                fullWidth
                loading={saving}
                disabled={saving || !clientName || !clientEmail}
                onClick={() => handleSave('sent')}
              >
                {saving ? 'Sending...' : 'Send Invoice'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Container>
    </div>
  )
}
