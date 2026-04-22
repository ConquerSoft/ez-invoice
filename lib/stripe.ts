import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function createPaymentLink(invoice: {
  id: string
  invoice_number: string
  client_name: string
  total: number
}): Promise<string> {
  const product = await stripe.products.create({
    name: `Invoice ${invoice.invoice_number} — ${invoice.client_name}`,
    metadata: { invoice_id: invoice.id },
  })

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(invoice.total * 100),
    currency: 'usd',
  })

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { invoice_id: invoice.id },
  })

  return paymentLink.url
}
