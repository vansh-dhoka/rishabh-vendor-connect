-- Real Estate Vendor Portal - Initial Schema
-- Safe to run multiple times

create extension if not exists pgcrypto;

-- Enums
do $$ begin
  create type rfq_status as enum ('draft','sent','received','closed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type po_status as enum ('draft','issued','accepted','partially_received','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum ('draft','submitted','approved','paid','rejected','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('planned','active','on_hold','closed');
exception when duplicate_object then null; end $$;

-- Tables
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gstin varchar(15),
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text default 'IN',
  budget_limit numeric(14,2) default 0.00,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  gstin varchar(15),
  pan varchar(10),
  bank_name text,
  bank_account text,
  ifsc_code varchar(11),
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text default 'IN',
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_vendors_company on vendors(company_id);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  description text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  status project_status not null default 'planned',
  budget_limit numeric(14,2) default 0.00,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_projects_company on projects(company_id);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  description text,
  unit varchar(16) default 'unit',
  hsn_sac_code text,
  gst_rate numeric(5,2) default 0.00,
  base_price numeric(12,2) default 0.00,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_items_company on items(company_id);

create table if not exists quotation_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text,
  requested_by text,
  due_date date,
  status rfq_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_rfq_company on quotation_requests(company_id);
create index if not exists idx_rfq_project on quotation_requests(project_id);

create table if not exists quotation_items (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references quotation_requests(id) on delete cascade,
  item_id uuid references items(id) on delete set null,
  description text,
  quantity numeric(12,2) not null default 1,
  target_rate numeric(12,2),
  hsn_sac_code text,
  gst_rate numeric(5,2) default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_qitems_rfq on quotation_items(rfq_id);

-- Vendor Quotes
create table if not exists vendor_quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references quotation_requests(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete restrict,
  status text not null default 'submitted',
  total numeric(14,2) default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_vquotes_rfq on vendor_quotes(rfq_id);
create index if not exists idx_vquotes_vendor on vendor_quotes(vendor_id);

create table if not exists vendor_quote_items (
  id uuid primary key default gen_random_uuid(),
  vendor_quote_id uuid not null references vendor_quotes(id) on delete cascade,
  rfq_item_id uuid references quotation_items(id) on delete set null,
  description text,
  quantity numeric(12,2) not null default 1,
  unit_rate numeric(12,2) not null default 0.00,
  hsn_sac_code text,
  gst_rate numeric(5,2) default 0.00,
  line_total numeric(14,2) not null default 0.00
);
create index if not exists idx_vqitems_vq on vendor_quote_items(vendor_quote_id);

create table if not exists negotiation_logs (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references quotation_requests(id) on delete cascade,
  vendor_id uuid references vendors(id) on delete set null,
  item_id uuid references items(id) on delete set null,
  message text,
  offered_rate numeric(12,2),
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists idx_negotiations_rfq on negotiation_logs(rfq_id);
create index if not exists idx_negotiations_vendor on negotiation_logs(vendor_id);

create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  vendor_id uuid not null references vendors(id) on delete restrict,
  rfq_id uuid references quotation_requests(id) on delete set null,
  po_number text unique,
  issue_date date default now(),
  status po_status not null default 'draft',
  currency varchar(3) default 'INR',
  subtotal numeric(14,2) default 0.00,
  tax_cgst numeric(14,2) default 0.00,
  tax_sgst numeric(14,2) default 0.00,
  tax_igst numeric(14,2) default 0.00,
  total numeric(14,2) default 0.00,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_pos_company on purchase_orders(company_id);
create index if not exists idx_pos_vendor on purchase_orders(vendor_id);

create table if not exists po_items (
  id uuid primary key default gen_random_uuid(),
  po_id uuid not null references purchase_orders(id) on delete cascade,
  item_id uuid references items(id) on delete set null,
  description text,
  hsn_sac_code text,
  gst_rate numeric(5,2) default 0.00,
  quantity numeric(12,2) not null default 1,
  unit_rate numeric(12,2) not null default 0.00,
  line_subtotal numeric(14,2) not null default 0.00,
  tax_cgst numeric(14,2) not null default 0.00,
  tax_sgst numeric(14,2) not null default 0.00,
  tax_igst numeric(14,2) not null default 0.00,
  line_total numeric(14,2) not null default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_po_items_po on po_items(po_id);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete restrict,
  po_id uuid references purchase_orders(id) on delete set null,
  invoice_number text unique,
  invoice_date date default now(),
  due_date date,
  status invoice_status not null default 'draft',
  currency varchar(3) default 'INR',
  subtotal numeric(14,2) default 0.00,
  tax_cgst numeric(14,2) default 0.00,
  tax_sgst numeric(14,2) default 0.00,
  tax_igst numeric(14,2) default 0.00,
  total numeric(14,2) default 0.00,
  pdf_path text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_invoices_company on invoices(company_id);
create index if not exists idx_invoices_vendor on invoices(vendor_id);

-- Unique constraint to prevent duplicate POs for same RFQ
create unique index if not exists idx_pos_unique_rfq on purchase_orders(rfq_id) where rfq_id is not null;

-- Audit logs table
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  action text not null, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values jsonb,
  new_values jsonb,
  changed_by uuid, -- user_id when available
  changed_at timestamptz not null default now(),
  ip_address inet,
  user_agent text
);

-- Performance indexes
create index if not exists idx_audit_logs_table_record on audit_logs(table_name, record_id);
create index if not exists idx_audit_logs_changed_at on audit_logs(changed_at);
create index if not exists idx_audit_logs_changed_by on audit_logs(changed_by);

-- Additional performance indexes
create index if not exists idx_companies_is_deleted on companies(is_deleted);
create index if not exists idx_vendors_is_deleted on vendors(is_deleted);
create index if not exists idx_projects_is_deleted on projects(is_deleted);
create index if not exists idx_items_is_deleted on items(is_deleted);
create index if not exists idx_pos_is_deleted on purchase_orders(is_deleted);
create index if not exists idx_invoices_is_deleted on invoices(is_deleted);

-- Status indexes for filtering
create index if not exists idx_pos_status on purchase_orders(status);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_projects_status on projects(status);

-- HSN/GST indexes for filtering
create index if not exists idx_items_hsn on items(hsn_sac_code);
create index if not exists idx_items_gst_rate on items(gst_rate);

-- Budget tracking views
create or replace view project_spend as
select 
  p.id as project_id,
  p.company_id,
  p.budget_limit,
  coalesce(sum(po.total), 0) as total_spent,
  p.budget_limit - coalesce(sum(po.total), 0) as remaining_budget
from projects p
left join purchase_orders po on p.id = po.project_id and po.status not in ('cancelled')
group by p.id, p.company_id, p.budget_limit;

create or replace view company_spend as
select 
  c.id as company_id,
  c.budget_limit,
  coalesce(sum(po.total), 0) as total_spent,
  c.budget_limit - coalesce(sum(po.total), 0) as remaining_budget
from companies c
left join purchase_orders po on c.id = po.company_id and po.status not in ('cancelled')
group by c.id, c.budget_limit;


