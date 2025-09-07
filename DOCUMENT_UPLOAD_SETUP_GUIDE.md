# Document Upload Setup Guide

## Overview
This guide explains how to set up document upload functionality for the Internship Management System. The system now supports uploading Resume, Cover Letter, Academic Transcript, and additional documents.

## Database Setup Required

### 1. Add Document Columns to Database
Your `internship_application_master` table needs the following columns for storing document file paths:

```sql
ALTER TABLE internship_application_master 
ADD COLUMN resume_path VARCHAR(500) NULL,
ADD COLUMN cover_letter_path VARCHAR(500) NULL,
ADD COLUMN academic_transcript_path VARCHAR(500) NULL,
ADD COLUMN additional_documents_path TEXT NULL;
```

**Run the SQL script:** Use `add_document_columns.sql` to add these columns to your database.

**Verify setup:** Use `verify_database_structure.sql` to check if columns were added correctly.

### 2. Create Upload Directory
The system saves files to `./uploads/applications/` directory. Ensure this directory exists and has write permissions:

```bash
mkdir -p uploads/applications
chmod 755 uploads/applications
```

## Features Implemented

### Backend (Spring Boot)
✅ **Document Upload Handling**: Controller accepts multipart/form-data requests
✅ **File Storage**: Files saved with unique names to prevent conflicts
✅ **Database Integration**: File paths stored in database columns
✅ **Document Retrieval**: API endpoints to download/view uploaded documents
✅ **Security**: Access control for document viewing
✅ **CORS Configuration**: Proper handling of multipart requests

### Frontend (React)
✅ **File Upload UI**: User-friendly document upload interface
✅ **File Validation**: Accept specific file formats (PDF, DOC, DOCX, JPG, PNG)
✅ **Required Documents**: Resume and Academic Transcript marked as mandatory
✅ **Visual Feedback**: File selection indicators and upload progress
✅ **Document Viewing**: Organization masters can view/download all documents

## API Endpoints

### Application Submission
- `POST /api/applications` (multipart/form-data) - Submit application with documents
- `POST /api/applications` (application/json) - Submit application without documents (backward compatibility)

### Document Management
- `GET /api/applications/{id}/download/{type}` - Download specific document
- `GET /api/applications/{id}` - Get application details including document info
- `GET /api/applications/my-applications` - Get applicant's applications

### Test Endpoints
- `POST /api/applications/test-upload` - Test multipart upload functionality

## File Structure
```
uploads/
└── applications/
    ├── resume_userId_programId_timestamp.pdf
    ├── cover_letter_userId_programId_timestamp.pdf
    ├── transcript_userId_programId_timestamp.pdf
    └── additional_0_userId_programId_timestamp.pdf
```

## Testing

### 1. Test Multipart Upload
Open `test-multipart.html` in your browser to test:
- Simple file upload functionality
- Full application submission with documents

### 2. Test in React Application
1. Start backend server (port 8080)
2. Start frontend applications (ports 3000, 3001, 3002)
3. Login as applicant and submit application with documents
4. Login as organization master and view application documents

## Troubleshooting

### Common Issues

**415 Unsupported Media Type Error:**
- Ensure CORS is properly configured
- Check that controller accepts `multipart/form-data`
- Verify frontend sends FormData (not JSON) for file uploads

**File Upload Fails:**
- Check upload directory exists and has write permissions
- Verify file size limits in `application.properties`
- Check file format restrictions

**Documents Not Visible:**
- Ensure database columns were added correctly
- Check that file paths are being saved to database
- Verify document retrieval API endpoints work

### Configuration Files
- `application.properties` - Multipart configuration
- `CorsConfig.java` - CORS settings for multipart requests
- `SecurityConfig.java` - Security permissions for endpoints

## Next Steps

1. **Run Database Migration**: Execute `add_document_columns.sql`
2. **Create Upload Directory**: Ensure `uploads/applications/` exists
3. **Test Upload**: Use `test-multipart.html` to verify functionality
4. **Deploy**: Update production database and create upload directories
5. **Monitor**: Check file storage and cleanup old files as needed

## Security Considerations

- File type validation prevents malicious uploads
- Access control ensures only authorized users can view documents
- File paths stored in database (not direct file access)
- Upload directory should be outside web root for security
- Consider implementing file size limits and virus scanning

## Production Deployment

For production deployment:
1. Use cloud storage (AWS S3, Google Cloud Storage) instead of local files
2. Implement file cleanup policies
3. Add virus scanning for uploaded files
4. Use CDN for document serving
5. Implement audit logging for document access