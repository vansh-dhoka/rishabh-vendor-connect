#!/bin/bash

# Deployment script for Real Estate Vendor Portal Backend
# Run this script after deploying to Render

echo "🚀 Starting deployment process..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📊 Running database migrations..."
psql "$DATABASE_URL" -f db/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully"
else
    echo "❌ Database schema creation failed"
    exit 1
fi

echo "🌱 Seeding initial data..."
psql "$DATABASE_URL" -f db/seed.sql

if [ $? -eq 0 ]; then
    echo "✅ Initial data seeded successfully"
else
    echo "❌ Data seeding failed"
    exit 1
fi

echo "📁 Creating upload directories..."
mkdir -p uploads/invoices
mkdir -p uploads/documents

echo "✅ Deployment completed successfully!"
echo "🔗 Your API is ready at: https://your-backend-url.onrender.com"
echo "📋 Default login credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
