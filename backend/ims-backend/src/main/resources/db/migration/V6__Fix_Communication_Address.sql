-- backend/ims-backend/src/main/resources/db/migration/V6__Fix_Communication_Address.sql
ALTER TABLE internship_application_master
ALTER COLUMN communication_address SET DEFAULT '';

UPDATE internship_application_master
SET communication_address = ''
WHERE communication_address IS NULL;