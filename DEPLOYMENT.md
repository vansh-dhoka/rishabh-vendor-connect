# Real Estate Vendor Portal - Deployment Guide

## Overview
This guide covers deploying the Real Estate Vendor Portal on Render with PostgreSQL database.

## Architecture
- **Backend**: Node.js/Express API server
- **Frontend**: React static site
- **Database**: PostgreSQL
- **Storage**: Local file system (free tier) or S3 (paid tier)

## Prerequisites
1. Render account (free tier available)
2. GitHub repository with the code
3. PostgreSQL database (Render provides free tier)

## Backend Deployment

### 1. Create Backend Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `expensify-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2. Environment Variables
Set these in Render dashboard under "Environment":

```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=<generate-a-secure-random-string>
DATABASE_URL=<will-be-set-automatically-by-render>
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<optional-for-s3>
AWS_SECRET_ACCESS_KEY=<optional-for-s3>
S3_BUCKET=expensify-uploads
STORAGE_TYPE=local
UPLOAD_DIR=uploads
```

### 3. Database Setup
1. Create a PostgreSQL database on Render:
   - Go to "New +" → "PostgreSQL"
   - Name: `expensify-db`
   - Plan: Free
2. Note the connection string for environment variables

### 4. Run Database Migrations
After deployment, run migrations:

```bash
# Connect to your Render service via SSH or use Render Shell
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/seed.sql
```

Or use the npm script:
```bash
npm run migrate
```

## Frontend Deployment

### 1. Create Static Site on Render
1. Go to "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `expensify-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: Free

### 2. Environment Variables
Set in Render dashboard:

```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

## File Storage Configuration

### Option 1: Local Storage (Free Tier)
- Files stored in `uploads/` directory
- **Limitation**: Files lost on service restart
- **Suitable for**: Development and testing

### Option 2: AWS S3 (Recommended for Production)
1. Create S3 bucket
2. Set environment variables:
   ```bash
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET=your-bucket-name
   STORAGE_TYPE=s3
   ```

## Deployment Steps

### 1. Backend Deployment
```bash
# 1. Push code to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main

# 2. Create service on Render (via dashboard)
# 3. Set environment variables
# 4. Deploy and wait for build to complete
```

### 2. Database Setup
```bash
# After backend is deployed, run migrations
# Option A: Via Render Shell
render shell expensify-backend
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/seed.sql

# Option B: Via local psql (if you have the connection string)
psql "your-database-url" -f backend/db/schema.sql
psql "your-database-url" -f backend/db/seed.sql
```

### 3. Frontend Deployment
```bash
# 1. Update VITE_API_URL in frontend environment
# 2. Create static site on Render
# 3. Deploy and wait for build
```

## Post-Deployment

### 1. Test the Application
1. Visit your frontend URL
2. Login with default credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Test key features:
   - Create companies and projects
   - Add vendors and items
   - Create RFQs and POs
   - Generate invoices and PDFs

### 2. Monitor and Maintain
- Check Render logs for errors
- Monitor database usage (free tier has limits)
- Set up monitoring for production use

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL environment variable
   - Ensure database is running
   - Verify connection string format

2. **File Upload Issues**
   - Check upload directory permissions
   - Verify STORAGE_TYPE setting
   - For S3: verify AWS credentials

3. **Frontend API Calls Failing**
   - Check VITE_API_URL environment variable
   - Verify backend is running
   - Check CORS settings

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

### Logs and Debugging
- Backend logs: Render Dashboard → Service → Logs
- Database logs: Render Dashboard → Database → Logs
- Frontend build logs: Render Dashboard → Static Site → Logs

## Production Considerations

### Security
- Change default admin credentials
- Use strong JWT secrets
- Enable HTTPS (automatic on Render)
- Set up proper CORS policies

### Performance
- Upgrade to paid plans for better performance
- Use CDN for static assets
- Implement caching strategies
- Monitor database performance

### Backup
- Regular database backups
- File storage backups (if using local storage)
- Environment variable backups

## Cost Estimation (Free Tier)
- Backend: Free (with limitations)
- Frontend: Free
- Database: Free (1GB limit)
- Total: $0/month

## Scaling
For production use, consider:
- Paid Render plans for better performance
- AWS S3 for file storage
- Database scaling options
- Load balancing for high traffic

## Support
- Render Documentation: https://render.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- React Documentation: https://react.dev/
