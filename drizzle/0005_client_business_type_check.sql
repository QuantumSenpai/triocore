-- Migration: Add tolerant check constraint for client type (business_name)
-- Allowed types: 'Company', 'Brand', 'Startup', 'Individual', and tolerant of legacy 'lawdaaa'

ALTER TABLE clients 
ADD CONSTRAINT clients_business_name_check 
CHECK (business_name IS NULL OR business_name IN ('Company', 'Brand', 'Startup', 'Individual', 'lawdaaa')) 
NOT VALID;

ALTER TABLE clients VALIDATE CONSTRAINT clients_business_name_check;
