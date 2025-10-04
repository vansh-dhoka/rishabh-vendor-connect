#!/usr/bin/env node

// Simple script to create sample data for the dashboard
import { pool } from '../src/db.js'

const COMPANY_ID = '0bfa0b4e-6f4f-4829-9e1e-b86219a0ab28'

async function createSampleData() {
  try {
    console.log('Creating sample data...')
    
    // Create a project
    const projectResult = await pool.query(`
      INSERT INTO projects (id, company_id, name, description, address_line1, city, state, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440001',
      COMPANY_ID,
      'Luxury Apartments Phase 1',
      'High-end residential project',
      '456 Construction Site',
      'Mumbai',
      'Maharashtra',
      'active'
    ])
    
    const projectId = projectResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440001'
    console.log('Project created:', projectId)
    
    // Create vendors
    const vendorResult = await pool.query(`
      INSERT INTO vendors (id, company_id, name, gstin, email, phone, address_line1, city, state) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440002',
      COMPANY_ID,
      'ABC Construction Ltd',
      '27ABCDE1234F1Z5',
      'contact@abcconstruction.com',
      '+91-9876543210',
      '789 Industrial Area',
      'Pune',
      'Maharashtra'
    ])
    
    const vendorId = vendorResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440002'
    console.log('Vendor created:', vendorId)
    
    // Create items
    await pool.query(`
      INSERT INTO items (id, company_id, name, description, unit, hsn_sac_code, gst_rate, base_price) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      ON CONFLICT (id) DO NOTHING
    `, [
      '550e8400-e29b-41d4-a716-446655440004',
      COMPANY_ID,
      'Cement',
      'Portland Cement Grade 53',
      'bags',
      '25232930',
      28.00,
      350.00
    ])
    
    // Create RFQ
    const rfqResult = await pool.query(`
      INSERT INTO quotation_requests (id, company_id, project_id, title, description, status) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440007',
      COMPANY_ID,
      projectId,
      'Construction Materials RFQ',
      'Request for construction materials for Phase 1',
      'sent'
    ])
    
    const rfqId = rfqResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440007'
    console.log('RFQ created:', rfqId)
    
    // Create RFQ items
    await pool.query(`
      INSERT INTO quotation_items (id, rfq_id, item_id, description, quantity, target_rate, hsn_sac_code, gst_rate) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      ON CONFLICT (id) DO NOTHING
    `, [
      '550e8400-e29b-41d4-a716-446655440008',
      rfqId,
      '550e8400-e29b-41d4-a716-446655440004',
      'Cement bags',
      1000,
      350.00,
      '25232930',
      28.00
    ])
    
    // Create vendor quote
    const quoteResult = await pool.query(`
      INSERT INTO vendor_quotes (id, rfq_id, vendor_id, status, total) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440010',
      rfqId,
      vendorId,
      'submitted',
      448000.00
    ])
    
    const quoteId = quoteResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440010'
    console.log('Vendor quote created:', quoteId)
    
    // Create PO
    const poResult = await pool.query(`
      INSERT INTO purchase_orders (id, company_id, project_id, vendor_id, rfq_id, po_number, status, currency, subtotal, tax_cgst, tax_sgst, tax_igst, total) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440013',
      COMPANY_ID,
      projectId,
      vendorId,
      rfqId,
      'PO-20241201000001',
      'issued',
      'INR',
      660000.00,
      0.00,
      0.00,
      118800.00,
      778800.00
    ])
    
    const poId = poResult.rows[0]?.id || '550e8400-e29b-41d4-a716-446655440013'
    console.log('PO created:', poId)
    
    // Create invoice
    await pool.query(`
      INSERT INTO invoices (id, company_id, vendor_id, po_id, invoice_number, invoice_date, due_date, status, currency, subtotal, tax_cgst, tax_sgst, tax_igst, total) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      ON CONFLICT (id) DO NOTHING
    `, [
      '550e8400-e29b-41d4-a716-446655440016',
      COMPANY_ID,
      vendorId,
      poId,
      'INV-2024-001',
      '2024-12-01',
      '2024-12-31',
      'submitted',
      'INR',
      660000.00,
      0.00,
      0.00,
      118800.00,
      778800.00
    ])
    
    console.log('Sample data created successfully!')
    console.log('Company ID:', COMPANY_ID)
    console.log('Project ID:', projectId)
    console.log('Vendor ID:', vendorId)
    console.log('RFQ ID:', rfqId)
    console.log('PO ID:', poId)
    
  } catch (error) {
    console.error('Error creating sample data:', error)
  } finally {
    await pool.end()
  }
}

createSampleData()
