-- Seed data for Real Estate Vendor Portal
-- Run this after schema.sql

-- Insert sample company
INSERT INTO companies (id, name, gstin, address_line1, city, state, postal_code) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Sample Real Estate Co', '29ABCDE1234F1Z5', '123 Business Park', 'Mumbai', 'Maharashtra', '400001');

-- Insert sample project
INSERT INTO projects (id, company_id, name, description, address_line1, city, state, status) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Luxury Apartments Phase 1', 'High-end residential project', '456 Construction Site', 'Mumbai', 'Maharashtra', 'active');

-- Insert sample vendors
INSERT INTO vendors (id, company_id, name, gstin, email, phone, address_line1, city, state) VALUES 
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'ABC Construction Ltd', '27ABCDE1234F1Z5', 'contact@abcconstruction.com', '+91-9876543210', '789 Industrial Area', 'Pune', 'Maharashtra'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'XYZ Materials Supply', '24ABCDE1234F1Z5', 'sales@xyzmaterials.com', '+91-9876543211', '321 Supply Chain', 'Delhi', 'Delhi');

-- Insert sample items
INSERT INTO items (id, company_id, name, description, unit, hsn_sac_code, gst_rate, base_price) VALUES 
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Cement', 'Portland Cement Grade 53', 'bags', '25232930', 28.00, 350.00),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Steel Rods', 'TMT Steel Rods 12mm', 'kg', '72142000', 18.00, 65.00),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Electrical Wiring', 'Copper Wire 2.5mm', 'meters', '85444200', 18.00, 120.00);

-- Insert sample RFQ
INSERT INTO quotation_requests (id, company_id, project_id, title, description, status) VALUES 
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Construction Materials RFQ', 'Request for construction materials for Phase 1', 'sent');

-- Insert sample RFQ items
INSERT INTO quotation_items (id, rfq_id, item_id, description, quantity, target_rate, hsn_sac_code, gst_rate) VALUES 
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'Cement bags', 1000, 350.00, '25232930', 28.00),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', 'Steel rods', 5000, 65.00, '72142000', 18.00);

-- Insert sample vendor quote
INSERT INTO vendor_quotes (id, rfq_id, vendor_id, status, total) VALUES 
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'submitted', 448000.00);

-- Insert sample vendor quote items
INSERT INTO vendor_quote_items (id, vendor_quote_id, rfq_item_id, description, quantity, unit_rate, hsn_sac_code, gst_rate, line_total) VALUES 
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440008', 'Cement bags', 1000, 340.00, '25232930', 28.00, 340000.00),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440009', 'Steel rods', 5000, 64.00, '72142000', 18.00, 320000.00);

-- Insert sample purchase order
INSERT INTO purchase_orders (id, company_id, project_id, vendor_id, rfq_id, po_number, status, currency, subtotal, tax_cgst, tax_sgst, tax_igst, total) VALUES 
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'PO-20241201000001', 'issued', 'INR', 660000.00, 0.00, 0.00, 118800.00, 778800.00);

-- Insert sample PO items
INSERT INTO po_items (id, po_id, item_id, description, hsn_sac_code, gst_rate, quantity, unit_rate, line_subtotal, tax_cgst, tax_sgst, tax_igst, line_total) VALUES 
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Cement bags', '25232930', 28.00, 1000, 340.00, 340000.00, 0.00, 0.00, 95200.00, 435200.00),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', 'Steel rods', '72142000', 18.00, 5000, 64.00, 320000.00, 0.00, 0.00, 57600.00, 377600.00);

-- Insert sample invoice
INSERT INTO invoices (id, company_id, vendor_id, po_id, invoice_number, invoice_date, due_date, status, currency, subtotal, tax_cgst, tax_sgst, tax_igst, total) VALUES 
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440013', 'INV-2024-001', '2024-12-01', '2024-12-31', 'submitted', 'INR', 660000.00, 0.00, 0.00, 118800.00, 778800.00);
