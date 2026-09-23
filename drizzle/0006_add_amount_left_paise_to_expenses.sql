-- Migration: Add amount_left_paise to expenses table
-- Additive numeric field for Personal Expenses representing amount still owed to member

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS amount_left_paise INTEGER NOT NULL DEFAULT 0;
