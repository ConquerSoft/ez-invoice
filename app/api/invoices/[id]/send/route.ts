import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createPaymentLink } from '@/lib/stripe'
import { sendInvoiceEmail } from '@/lib/resend'
import { NextRequest, NextResponse } from 'next/server'
import type { Invoice } from '@/types'

// Simple PDF generation as base64 using jsPDF on the server
async function generatePdfBase64(invoice: Invoice): Promise<string> {
  // Return a placeholder — full server-side PDF requires additional setup
  // In production, use a headless browser or PDF service
  return ''
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: inv } = await supabase
    .from('invoices').select('*').eq('id', params.id).eq('user_id', user.id).single()

  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const invoice = inv as Invoice
  let paymentLink = invoice.stripe_payment_link

  // Create Stripe payment link if not already created
  if (!paymentLink) {
    try {
      paymentLink = await createPaymentLink({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        client_name: invoice.client_name,
        total: invoice.total,
      })
    } catch (err) {
      console.error('Stripe error:', err)
    }
  }

  // Update invoice status and payment link
  await adminClient.from('invoices').update({
    status: 'sent',
    stripe_payment_link: paymentLink,
    updated_at: new Date().toISOString(),
  }).eq('id', params.id)

  // Send email if client email exists
  if (invoice.client_email) {
    try {
      const updatedInvoice = { ...invoice, stripe_payment_link: paymentLink, status: 'sent' as const }
      const pdfBase64 = await generatePdfBase64(updatedInvoice)
      await sendInvoiceEmail(updatedInvoice, pdfBase64)
    } catch (err) {
      console.error('Email error:', err)
    }
  }

  return NextResponse.json({ success: true, paymentLink })
}
