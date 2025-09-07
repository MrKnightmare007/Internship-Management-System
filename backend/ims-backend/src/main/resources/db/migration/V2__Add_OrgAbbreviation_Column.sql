-- Add org_abbreviation column to organization_master table
ALTER TABLE organization_master ADD COLUMN IF NOT EXISTS org_abbreviation VARCHAR(50);