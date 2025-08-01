-- Migration to update logo_url column to TEXT type
-- This allows storing larger base64 image data

ALTER TABLE companies ALTER COLUMN logo_url TYPE TEXT; 