-- Migration: Add allocated_amount_paise to expenses table
-- Additive numeric field for Personal Expenses representing individual budget allocation for member

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS allocated_amount_paise INTEGER NOT NULL DEFAULT 0;
