import { Resend } from 'resend'
import type { Invoice } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendInvoiceEmail(invoice: Invoice, pdfBase64: string) {
  const resend = getResend()
  const paymentButton = invoice.stripe_payment_link
    ? `<div style="text-align:center;margin:32px 0"><a href="${invoice.stripe_payment_link}" style="background:#22c55e;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;display:inline-block">Pay Now — ${formatCurrency(invoice.total)}</a></div>`
    : ''

  await resend.emails.send({
    from: 'EZ Invoice <onboarding@resend.dev>',
    to: invoice.client_email!,
    subject: `Invoice ${invoice.invoice_number}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px"><div style="background:#111;color:#22c55e;padding:20px 24px;border-radius:8px 8px 0 0"><h1 style="margin:0">EZ Invoice</h1></div><div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px"><p>Hi ${invoice.client_name},</p><p>Invoice <strong>${invoice.invoice_number}</strong> for <strong>${formatCurrency(invoice.total)}</strong> is due on ${formatDate(invoice.due_date)}.</p>${paymentButton}</div></div>`,
    attachments: pdfBase64 ? [{ filename: `${invoice.invoice_number}.pdf`, content: pdfBase64 }] : [],
  })
}

export async function sendReminderEmail(invoice: Invoice) {
  const resend = getResend()
  await resend.emails.send({
    from: 'EZ Invoice <onboarding@resend.dev>',
    to: invoice.client_email!,
    subject: `Reminder: Invoice ${invoice.invoice_number} is overdue`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px"><p>Hi ${invoice.client_name}, this is a reminder that Invoice <strong>${invoice.invoice_number}</strong> for <strong>${formatCurrency(invoice.total)}</strong> was due on ${formatDate(invoice.due_date)}.</p>${invoice.stripe_payment_link ? `<div style="text-align:center;margin:24px 0"><a href="${invoice.stripe_payment_link}" style="background:#22c55e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Pay Now</a></div>` : ''}</div>`,
  })
}
