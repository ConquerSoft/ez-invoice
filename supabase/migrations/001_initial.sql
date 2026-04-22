-- EZ Invoice Database Schema

create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  email text,
  address text,
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  invoice_number text not null,
  client_name text not null,
  client_email text,
  client_address text,
  issue_date date not null,
  due_date date not null,
  line_items jsonb not null default '[]',
  subtotal numeric(10,2) default 0,
  tax_rate numeric(5,2) default 0,
  tax_amount numeric(10,2) default 0,
  total numeric(10,2) default 0,
  notes text,
  status text default 'draft',
  stripe_payment_link text,
  stripe_session_id text,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table clients enable row level security;
alter table invoices enable row level security;

drop policy if exists "users_own_clients" on clients;
drop policy if exists "users_own_invoices" on invoices;

create policy "users_own_clients" on clients for all using (auth.uid() = user_id);
create policy "users_own_invoices" on invoices for all using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists invoices_updated_at on invoices;
create trigger invoices_updated_at before update on invoices
  for each row execute function update_updated_at();
