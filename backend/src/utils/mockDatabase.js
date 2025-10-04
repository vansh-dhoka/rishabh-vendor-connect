/**
 * Mock database for testing CRUD operations when PostgreSQL is not available
 */

// Mock data storage
const mockData = {
  companies: [
    {
      id: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
      name: 'Rishabh Developers',
      gstin: '27ABCDE1234F1Z5',
      address_line1: '123 Business Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'IN',
      budget_limit: 10000000.00,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  projects: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      company_id: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
      name: 'Luxury Apartments Phase 1',
      description: 'High-end residential project',
      address_line1: '456 Construction Site',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'active',
      budget_limit: 5000000.00,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  vendors: [
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      company_id: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
      name: 'ABC Construction Ltd',
      gstin: '27ABCDE1234F1Z5',
      email: 'contact@abcconstruction.com',
      phone: '+91-9876543210',
      address_line1: '789 Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'IN',
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  items: [
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      company_id: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
      name: 'Cement',
      description: 'Portland Cement Grade 53',
      unit: 'bags',
      hsn_sac_code: '25232930',
      gst_rate: 28.00,
      base_price: 350.00,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  quotation_requests: [
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      company_id: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Construction Materials RFQ',
      description: 'Request for construction materials for Phase 1',
      status: 'sent',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  quotation_items: [
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      rfq_id: '550e8400-e29b-41d4-a716-446655440007',
      item_id: '550e8400-e29b-41d4-a716-446655440004',
      description: 'Cement bags',
      quantity: 1000,
      target_rate: 350.00,
      hsn_sac_code: '25232930',
      gst_rate: 28.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  vendor_quotes: [
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      rfq_id: '550e8400-e29b-41d4-a716-446655440007',
      vendor_id: '550e8400-e29b-41d4-a716-446655440002',
      status: 'submitted',
      total: 448000.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  vendor_quote_items: [
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      vendor_quote_id: '550e8400-e29b-41d4-a716-446655440010',
      rfq_item_id: '550e8400-e29b-41d4-a716-446655440008',
      description: 'Cement bags',
      quantity: 1000,
      unit_rate: 350.00,
      hsn_sac_code: '25232930',
      gst_rate: 28.00,
      line_total: 350000.00
    }
  ],
  purchase_orders: [
    {
      id: '550e8400-e29b-41d4-a716-446655440013',
      company_id: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
      project_id: '550e8400-e29b-41d4-a716-446655440001',
      vendor_id: '550e8400-e29b-41d4-a716-446655440002',
      rfq_id: '550e8400-e29b-41d4-a716-446655440007',
      po_number: 'PO-20241201000001',
      issue_date: new Date().toISOString().split('T')[0],
      status: 'issued',
      currency: 'INR',
      subtotal: 660000.00,
      tax_cgst: 0.00,
      tax_sgst: 0.00,
      tax_igst: 118800.00,
      total: 778800.00,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  po_items: [
    {
      id: '550e8400-e29b-41d4-a716-446655440014',
      po_id: '550e8400-e29b-41d4-a716-446655440013',
      item_id: '550e8400-e29b-41d4-a716-446655440004',
      description: 'Cement bags',
      hsn_sac_code: '25232930',
      gst_rate: 28.00,
      quantity: 1000,
      unit_rate: 350.00,
      line_subtotal: 350000.00,
      tax_cgst: 0.00,
      tax_sgst: 0.00,
      tax_igst: 63000.00,
      line_total: 413000.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  invoices: [
    {
      id: '550e8400-e29b-41d4-a716-446655440016',
      company_id: '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28',
      vendor_id: '550e8400-e29b-41d4-a716-446655440002',
      po_id: '550e8400-e29b-41d4-a716-446655440013',
      invoice_number: 'INV-2024-001',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'submitted',
      currency: 'INR',
      subtotal: 660000.00,
      tax_cgst: 0.00,
      tax_sgst: 0.00,
      tax_igst: 118800.00,
      total: 778800.00,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

// Mock database operations
export class MockDatabase {
  constructor() {
    this.data = JSON.parse(JSON.stringify(mockData)) // Deep clone
  }

  async query(sql, params = []) {
    console.log('Mock DB Query:', sql, params)
    
    // Parse SQL to determine operation
    const sqlLower = sql.toLowerCase().trim()
    
    if (sqlLower.startsWith('select')) {
      return this.handleSelect(sql, params)
    } else if (sqlLower.startsWith('insert')) {
      return this.handleInsert(sql, params)
    } else if (sqlLower.startsWith('update')) {
      return this.handleUpdate(sql, params)
    } else if (sqlLower.startsWith('delete')) {
      return this.handleDelete(sql, params)
    }
    
    return { rows: [], rowCount: 0 }
  }

  handleSelect(sql, params) {
    const sqlLower = sql.toLowerCase()
    
    // Simple SELECT parsing
    if (sqlLower.includes('from companies')) {
      let results = this.data.companies.filter(c => !c.is_deleted)
      
      // Apply WHERE conditions
      if (sqlLower.includes('where id = $1')) {
        results = results.filter(c => c.id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    if (sqlLower.includes('from projects')) {
      let results = this.data.projects.filter(p => !p.is_deleted)
      
      if (sqlLower.includes('where id = $1')) {
        results = results.filter(p => p.id === params[0])
      }
      if (sqlLower.includes('where company_id = $1')) {
        results = results.filter(p => p.company_id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    if (sqlLower.includes('from vendors')) {
      let results = this.data.vendors.filter(v => !v.is_deleted)
      
      if (sqlLower.includes('where id = $1')) {
        results = results.filter(v => v.id === params[0])
      }
      if (sqlLower.includes('where company_id = $1')) {
        results = results.filter(v => v.company_id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    if (sqlLower.includes('from items')) {
      let results = this.data.items.filter(i => !i.is_deleted)
      
      if (sqlLower.includes('where id = $1')) {
        results = results.filter(i => i.id === params[0])
      }
      if (sqlLower.includes('where company_id = $1')) {
        results = results.filter(i => i.company_id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    if (sqlLower.includes('from quotation_requests')) {
      let results = this.data.quotation_requests
      
      if (sqlLower.includes('where id = $1')) {
        results = results.filter(r => r.id === params[0])
      }
      if (sqlLower.includes('where company_id = $1')) {
        results = results.filter(r => r.company_id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    if (sqlLower.includes('from quotation_items')) {
      let results = this.data.quotation_items
      
      if (sqlLower.includes('where rfq_id = $1')) {
        results = results.filter(qi => qi.rfq_id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    if (sqlLower.includes('from vendor_quotes')) {
      let results = this.data.vendor_quotes
      
      if (sqlLower.includes('where rfq_id = $1')) {
        results = results.filter(vq => vq.rfq_id === params[0])
      }
      if (sqlLower.includes('where id = $1')) {
        results = results.filter(vq => vq.id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    if (sqlLower.includes('from vendor_quote_items')) {
      let results = this.data.vendor_quote_items
      
      if (sqlLower.includes('where vendor_quote_id = $1')) {
        results = results.filter(vqi => vqi.vendor_quote_id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    if (sqlLower.includes('from purchase_orders')) {
      let results = this.data.purchase_orders.filter(po => !po.is_deleted)
      
      if (sqlLower.includes('where id = $1')) {
        results = results.filter(po => po.id === params[0])
      }
      if (sqlLower.includes('where company_id = $1')) {
        results = results.filter(po => po.company_id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    if (sqlLower.includes('from po_items')) {
      let results = this.data.po_items
      
      if (sqlLower.includes('where po_id = $1')) {
        results = results.filter(poi => poi.po_id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    if (sqlLower.includes('from invoices')) {
      let results = this.data.invoices.filter(i => !i.is_deleted)
      
      if (sqlLower.includes('where id = $1')) {
        results = results.filter(i => i.id === params[0])
      }
      if (sqlLower.includes('where company_id = $1')) {
        results = results.filter(i => i.company_id === params[0])
      }
      
      return { rows: results, rowCount: results.length }
    }
    
    // Health check query
    if (sqlLower.includes('select 1 as ok')) {
      return { rows: [{ ok: 1, timestamp: new Date() }], rowCount: 1 }
    }
    
    return { rows: [], rowCount: 0 }
  }

  handleInsert(sql, params) {
    const sqlLower = sql.toLowerCase()
    
    if (sqlLower.includes('into companies')) {
      const newCompany = {
        id: this.generateId(),
        name: params[0],
        gstin: params[1],
        address_line1: params[2],
        address_line2: params[3],
        city: params[4],
        state: params[5],
        postal_code: params[6],
        country: params[7] || 'IN',
        budget_limit: 0.00,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      this.data.companies.push(newCompany)
      return { rows: [newCompany], rowCount: 1 }
    }
    
    if (sqlLower.includes('into quotation_requests')) {
      const newRfq = {
        id: this.generateId(),
        company_id: params[0],
        project_id: params[1],
        title: params[2],
        description: params[3],
        due_date: params[4],
        status: 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      this.data.quotation_requests.push(newRfq)
      return { rows: [newRfq], rowCount: 1 }
    }
    
    if (sqlLower.includes('into quotation_items')) {
      const newItem = {
        id: this.generateId(),
        rfq_id: params[0],
        item_id: params[1],
        description: params[2],
        quantity: params[3] || 1,
        target_rate: params[4],
        hsn_sac_code: params[5],
        gst_rate: params[6] || 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      this.data.quotation_items.push(newItem)
      return { rows: [newItem], rowCount: 1 }
    }
    
    if (sqlLower.includes('into vendor_quotes')) {
      const newQuote = {
        id: this.generateId(),
        rfq_id: params[0],
        vendor_id: params[1],
        status: 'submitted',
        total: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      this.data.vendor_quotes.push(newQuote)
      return { rows: [newQuote], rowCount: 1 }
    }
    
    if (sqlLower.includes('into purchase_orders')) {
      const newPO = {
        id: this.generateId(),
        company_id: params[0],
        project_id: params[1],
        vendor_id: params[2],
        rfq_id: params[3],
        po_number: params[4],
        issue_date: new Date().toISOString().split('T')[0],
        status: 'issued',
        currency: 'INR',
        subtotal: params[5] || 0.00,
        tax_cgst: 0.00,
        tax_sgst: 0.00,
        tax_igst: 0.00,
        total: params[6] || 0.00,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      this.data.purchase_orders.push(newPO)
      return { rows: [newPO], rowCount: 1 }
    }
    
    return { rows: [], rowCount: 0 }
  }

  handleUpdate(sql, params) {
    const sqlLower = sql.toLowerCase()
    
    if (sqlLower.includes('update quotation_requests set status')) {
      const rfqId = params[0]
      const rfq = this.data.quotation_requests.find(r => r.id === rfqId)
      if (rfq) {
        rfq.status = 'closed'
        rfq.updated_at = new Date().toISOString()
        return { rows: [rfq], rowCount: 1 }
      }
    }
    
    if (sqlLower.includes('update purchase_orders set status')) {
      const poId = params[0]
      const po = this.data.purchase_orders.find(p => p.id === poId)
      if (po) {
        po.status = params[1]
        po.updated_at = new Date().toISOString()
        return { rows: [po], rowCount: 1 }
      }
    }
    
    if (sqlLower.includes('update invoices set status')) {
      const invoiceId = params[0]
      const invoice = this.data.invoices.find(i => i.id === invoiceId)
      if (invoice) {
        invoice.status = params[1]
        invoice.updated_at = new Date().toISOString()
        return { rows: [invoice], rowCount: 1 }
      }
    }
    
    return { rows: [], rowCount: 0 }
  }

  handleDelete(sql, params) {
    // For soft deletes, we'll update is_deleted flag
    return { rows: [], rowCount: 0 }
  }

  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  async connect() {
    return this
  }

  release() {
    // Mock connection release
  }
}

// Create a singleton mock database instance
let mockDbInstance = null

function getMockDatabase() {
  if (!mockDbInstance) {
    mockDbInstance = new MockDatabase()
  }
  return mockDbInstance
}

// Create mock pool
export const mockPool = {
  query: async (sql, params) => {
    const db = getMockDatabase()
    return db.query(sql, params)
  },
  connect: async () => {
    return getMockDatabase()
  }
}
