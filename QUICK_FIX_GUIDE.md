# Quick Fix Guide for Application Submission Error

## Issues Fixed:

### 1. ✅ **500 Error - Missing Database Columns**
**Problem**: The error "not-null property references a null or transient value: com.webel.ims.InternshipApplication.applicantName" indicates missing database columns.

**Solution**: Run this SQL script on your database:
```sql
ALTER TABLE internship_application_master 
ADD COLUMN resume_path VARCHAR(500) NULL,
ADD COLUMN cover_letter_path VARCHAR(500) NULL,
ADD COLUMN academic_transcript_path VARCHAR(500) NULL,
ADD COLUMN additional_documents_path TEXT NULL;
```

### 2. ✅ **UI Change - University Registration → Resume Upload**
**Problem**: "University Registration Certificate" field should be replaced with "Resume Upload"

**Solution**: Updated ApplicationForm.js to:
- Remove "University Registration No." text field
- Add Resume upload field in its place
- Made universityRegNo optional in backend (defaults to "N/A")

### 3. ✅ **BrowsePrograms API Call Fix**
**Problem**: BrowsePrograms was sending JSON but backend expected specific content type

**Solution**: Added explicit Content-Type header for JSON requests

## Steps to Fix:

1. **Run Database Script**: Execute `simple_add_columns.sql` on your database
2. **Restart Backend**: Restart your Spring Boot application
3. **Test Application**: Try submitting an application again

## Files Modified:
- `frontend/ims-frontend/src/components/ApplicationForm.js` - UI changes
- `frontend/ims-frontend/src/components/BrowsePrograms.js` - API fix
- `backend/ims-backend/src/main/java/com/webel/ims/InternshipApplicationController.java` - Handle optional universityRegNo

## Expected Result:
- ✅ Application submission works without 500 error
- ✅ Resume upload field replaces University Registration field
- ✅ Both JSON (BrowsePrograms) and multipart (ApplicationForm) submissions work
- ✅ Documents are properly uploaded and stored

## Test:
1. Open applicant portal
2. Browse programs and click "Apply"
3. Fill form and upload resume
4. Submit application
5. Should see "Application submitted successfully!" message