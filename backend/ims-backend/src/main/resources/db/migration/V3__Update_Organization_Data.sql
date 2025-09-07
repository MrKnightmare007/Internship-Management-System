-- Update existing organizations to set org_abbreviation to a default value if null
UPDATE organization_master SET org_abbreviation = SUBSTRING(org_name, 1, 5) WHERE org_abbreviation IS NULL;