export interface LineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export interface Invoice {
  id: string
  user_id: string
  invoice_number: string
  client_name: string
  client_email: string | null
  client_address: string | null
  issue_date: string
  due_date: string
  line_items: LineItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  notes: string | null
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  stripe_payment_link: string | null
  stripe_session_id: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string | null
  address: string | null
  created_at: string
}
