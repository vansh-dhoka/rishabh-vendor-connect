# Ephemeral Storage Configuration for Render Free Plan

## Overview
Since the Render free plan doesn't include persistent storage, the Rishabh Vendor Connect application has been configured to use ephemeral storage in `/tmp` directories. This means files will be lost when the service restarts or redeploys.

## ⚠️ Important Limitations

### What Gets Lost on Restart/Redeploy:
- **Uploaded invoice files** (PDFs, images)
- **Generated PDF documents** (invoices, purchase orders)
- **Temporary file processing** data
- **Database backup files** (if stored locally)

### What Persists:
- **Database data** (PostgreSQL on Render)
- **Application code** and configuration
- **User accounts** and authentication
- **Business data** (companies, projects, vendors, etc.)

## 📁 Storage Configuration

### Directory Structure
```
/tmp/
├── uploads/          # User uploaded files
│   ├── invoices/     # Invoice uploads
│   └── documents/    # Other documents
├── pdfs/            # Generated PDFs
│   ├── invoices/    # Generated invoice PDFs
│   └── pos/         # Generated PO PDFs
└── backups/         # Database backups (temporary)
```

### Environment Variables
```bash
# Ephemeral storage paths
UPLOAD_DIR=/tmp/uploads
PDF_STORAGE_DIR=/tmp/pdfs
STORAGE_TYPE=local
```

## 🔄 Workflow Adaptations

### File Upload Process
1. **User uploads file** → Stored in `/tmp/uploads`
2. **File processed** → Metadata saved to database
3. **File path stored** → Database contains file location
4. **Service restart** → File lost, but metadata remains

### PDF Generation Process
1. **PDF generated** → Stored in `/tmp/pdfs`
2. **PDF served** → Downloaded by user
3. **Service restart** → PDF lost, but can be regenerated

### Invoice Processing
1. **Invoice uploaded** → Stored temporarily
2. **Data extracted** → Saved to database
3. **File processed** → Approval workflow continues
4. **Service restart** → Original file lost, but workflow continues

## 🛠️ Alternative Solutions

### For Production Use (Recommended)

#### 1. **Upgrade to Render Starter Plan**
- **Cost**: ~$7/month
- **Benefits**: Persistent disk storage
- **Storage**: 1GB+ persistent storage
- **Reliability**: Files persist across restarts

#### 2. **Use External Storage Services**

##### AWS S3 (Recommended)
```bash
# Environment variables for S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=rishabh-vendor-connect-uploads
STORAGE_TYPE=s3
```

##### Google Cloud Storage
```bash
# Environment variables for GCS
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path-to-credentials.json
GCS_BUCKET=rishabh-vendor-connect-uploads
STORAGE_TYPE=gcs
```

##### Cloudinary (For Images)
```bash
# Environment variables for Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
STORAGE_TYPE=cloudinary
```

### For Development/Testing

#### Current Ephemeral Setup Works For:
- **Development and testing**
- **Demo purposes**
- **Proof of concept**
- **Learning and experimentation**

## 🔧 Implementation Details

### File Upload Handling
```javascript
// Files are uploaded to /tmp/uploads
const uploadPath = path.join(process.env.UPLOAD_DIR || '/tmp/uploads', filename)

// Metadata is saved to database
await pool.query(
  'UPDATE invoices SET pdf_path = $1 WHERE id = $2',
  [uploadPath, invoiceId]
)
```

### PDF Generation
```javascript
// PDFs are generated in /tmp/pdfs
const pdfPath = createStructuredPdfPath(companyId, projectId, 'invoice', invoiceId)

// PDF is served and can be regenerated
const doc = createInvoicePdfWithTemplate(invoice, company, vendor)
```

### Database Backup
```javascript
// Backups are created in /tmp/backups
const backupPath = `/tmp/backups/backup_${date}.sql`
pg_dump(DATABASE_URL) > backupPath
```

## 📊 Impact Assessment

### Low Impact Features
- **User authentication** - No file dependencies
- **Company/project management** - Database only
- **Vendor management** - Database only
- **RFQ workflow** - Database only
- **Purchase orders** - Database only

### Medium Impact Features
- **Invoice processing** - Original files lost, but workflow continues
- **PDF generation** - Can be regenerated on demand
- **File downloads** - May fail if file was lost

### High Impact Features
- **Long-term file storage** - Not suitable for production
- **Audit trails with files** - Original files may be missing
- **Backup and restore** - Local backups lost on restart

## 🚀 Migration to Persistent Storage

### Step 1: Choose Storage Solution
1. **Render Starter Plan** (easiest)
2. **AWS S3** (most popular)
3. **Google Cloud Storage** (Google ecosystem)
4. **Cloudinary** (image-focused)

### Step 2: Update Configuration
```bash
# Update environment variables
STORAGE_TYPE=s3  # or gcs, cloudinary, etc.
# Add service-specific credentials
```

### Step 3: Update Code
```javascript
// Add storage service integration
import { uploadToS3, downloadFromS3 } from './utils/storage.js'

// Replace local file operations
const fileUrl = await uploadToS3(file, 'invoices/')
```

### Step 4: Migrate Existing Data
```javascript
// Migrate database file paths to URLs
// Update file serving endpoints
// Test file upload/download functionality
```

## 💡 Best Practices for Ephemeral Storage

### 1. **Process Files Immediately**
- Extract data from uploaded files
- Save metadata to database
- Don't rely on file persistence

### 2. **Generate PDFs On-Demand**
- Don't store generated PDFs long-term
- Regenerate when needed
- Cache in memory if possible

### 3. **Use Database for Critical Data**
- Store all business data in PostgreSQL
- Use files only for temporary processing
- Implement data validation

### 4. **Implement File Regeneration**
- PDFs can be regenerated from database data
- Provide fallback mechanisms
- Handle missing files gracefully

## 🔍 Monitoring and Alerts

### File System Monitoring
```javascript
// Monitor /tmp directory usage
const fs = require('fs')
const stats = fs.statSync('/tmp')
console.log(`Temporary storage usage: ${stats.size} bytes`)
```

### Error Handling
```javascript
// Handle missing files gracefully
try {
  const fileStream = fs.createReadStream(filePath)
  res.setHeader('Content-Type', 'application/pdf')
  fileStream.pipe(res)
} catch (error) {
  if (error.code === 'ENOENT') {
    // File not found - regenerate or return error
    res.status(404).json({ error: 'File not found, may have been lost on restart' })
  }
}
```

## 📋 Deployment Checklist for Free Plan

### ✅ Pre-Deployment
- [ ] Understand ephemeral storage limitations
- [ ] Configure `/tmp` directories
- [ ] Update environment variables
- [ ] Test file upload/download
- [ ] Verify PDF generation works

### ✅ Post-Deployment
- [ ] Test file uploads
- [ ] Test PDF generation
- [ ] Verify file cleanup on restart
- [ ] Monitor storage usage
- [ ] Plan for production storage upgrade

## 🎯 Recommendations

### For Development/Testing
- **Current setup is perfect** for development
- **Free plan works well** for demos and testing
- **No additional configuration needed**

### For Production
- **Upgrade to Starter plan** for persistent storage
- **Or implement S3/GCS** for external storage
- **Consider file retention policies**
- **Implement proper backup strategies**

---

**Note**: The current ephemeral storage configuration is ideal for development, testing, and demonstration purposes. For production use with real business data, consider upgrading to a plan with persistent storage or implementing external storage solutions.
