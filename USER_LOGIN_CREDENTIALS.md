# Rishabh Vendor Connect - User Login Credentials

## Overview
This document provides login credentials for different user types in the Rishabh Vendor Connect system. Each user type has specific permissions and access levels.

## User Roles & Permissions

### 🔑 Super Admin
- **Full system access** across all companies
- **User management** capabilities
- **System configuration** and monitoring
- **All CRUD operations** on all entities

### 🏢 Company Admin
- **Full access** to their assigned company
- **User management** within their company
- **All operations** for their company's data
- **Budget management** and reporting

### 📋 Project Manager
- **Project management** and vendor coordination
- **RFQ creation** and management
- **Quote evaluation** and negotiation
- **PO creation** from approved quotes

### 💰 Finance Manager
- **Purchase Order** approval and management
- **Invoice processing** and approval
- **Payment tracking** and financial reporting
- **Budget monitoring** and controls

### 🏗️ Vendor
- **Quote submission** for RFQs
- **Profile management** and updates
- **Invoice submission** for completed work
- **View assigned** RFQs and POs

### 👁️ Viewer
- **Read-only access** to company data
- **Report viewing** and analytics
- **Audit trail** access
- **No modification** permissions

---

## Login Credentials

### 🔑 Super Administrator
```
Email: superadmin@rishabhvendorconnect.com
Password: SuperAdmin@123
Role: Super Admin
Access: All Companies
```

### 🏢 Company Administrators

#### Rishabh Developers Admin
```
Email: admin@rishabhdevelopers.com
Password: CompanyAdmin@123
Role: Company Admin
Company: Rishabh Developers (company_1)
```

#### Premium Estates Admin
```
Email: admin@premiumestates.com
Password: CompanyAdmin@123
Role: Company Admin
Company: Premium Estates (company_2)
```

### 📋 Project Managers

#### Rishabh Developers - Project Manager
```
Email: pm@rishabhdevelopers.com
Password: ProjectManager@123
Role: Project Manager
Company: Rishabh Developers (company_1)
Name: John Smith
```

#### Premium Estates - Project Manager
```
Email: pm@premiumestates.com
Password: ProjectManager@123
Role: Project Manager
Company: Premium Estates (company_2)
Name: Sarah Johnson
```

### 💰 Finance Managers

#### Rishabh Developers - Finance Manager
```
Email: finance@rishabhdevelopers.com
Password: FinanceManager@123
Role: Finance Manager
Company: Rishabh Developers (company_1)
Name: Mike Chen
```

#### Premium Estates - Finance Manager
```
Email: finance@premiumestates.com
Password: FinanceManager@123
Role: Finance Manager
Company: Premium Estates (company_2)
Name: Lisa Wang
```

### 🏗️ Vendors

#### Steel Construction Co.
```
Email: vendor@steelconstruction.com
Password: Vendor@123
Role: Vendor
Company: Rishabh Developers (company_1)
Services: Steel construction, structural work
```

#### Electrical Works Ltd.
```
Email: vendor@electricalworks.com
Password: Vendor@123
Role: Vendor
Company: Rishabh Developers (company_1)
Services: Electrical installations, wiring
```

#### Plumbing Pro Services
```
Email: vendor@plumbingpro.com
Password: Vendor@123
Role: Vendor
Company: Premium Estates (company_2)
Services: Plumbing, water systems
```

### 👁️ Viewers

#### Audit Viewer
```
Email: viewer@rishabhdevelopers.com
Password: Viewer@123
Role: Viewer
Company: Rishabh Developers (company_1)
Access: Read-only
```

---

## Access Levels by Feature

| Feature | Super Admin | Company Admin | Project Manager | Finance Manager | Vendor | Viewer |
|---------|-------------|---------------|-----------------|-----------------|--------|--------|
| **Companies** | ✅ All | ✅ Own | ❌ | ❌ | ❌ | 👁️ Own |
| **Projects** | ✅ All | ✅ Own | ✅ Own | 👁️ Own | 👁️ Assigned | 👁️ Own |
| **Vendors** | ✅ All | ✅ Own | ✅ Own | 👁️ Own | ✅ Own Profile | 👁️ Own |
| **Items** | ✅ All | ✅ Own | ✅ Own | 👁️ Own | 👁️ Own | 👁️ Own |
| **RFQs** | ✅ All | ✅ Own | ✅ Own | 👁️ Own | 👁️ Assigned | 👁️ Own |
| **Quotes** | ✅ All | ✅ Own | ✅ Own | 👁️ Own | ✅ Own | 👁️ Own |
| **Purchase Orders** | ✅ All | ✅ Own | ✅ Own | ✅ Own | 👁️ Own | 👁️ Own |
| **Invoices** | ✅ All | ✅ Own | 👁️ Own | ✅ Own | ✅ Own | 👁️ Own |
| **User Management** | ✅ All | ✅ Own Company | ❌ | ❌ | ❌ | ❌ |
| **System Monitoring** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ = Full access (Create, Read, Update, Delete)
- 👁️ = Read-only access
- ❌ = No access

---

## Company Structure

### Company 1: Rishabh Developers
- **Admin**: admin@rishabhdevelopers.com
- **Project Manager**: John Smith (pm@rishabhdevelopers.com)
- **Finance Manager**: Mike Chen (finance@rishabhdevelopers.com)
- **Vendors**: 
  - Steel Construction Co.
  - Electrical Works Ltd.
- **Viewer**: Audit Viewer

### Company 2: Premium Estates
- **Admin**: admin@premiumestates.com
- **Project Manager**: Sarah Johnson (pm@premiumestates.com)
- **Finance Manager**: Lisa Wang (finance@premiumestates.com)
- **Vendors**: 
  - Plumbing Pro Services

---

## Security Notes

### Password Policy
- All passwords follow a strong pattern: `Role@123`
- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 12 hours
- Users can be deactivated by setting `isActive: false`

### Access Control
- **Company-scoped access**: Users can only access data from their assigned company
- **Role-based permissions**: Each role has specific capabilities
- **Super Admin exception**: Can access all companies and data
- **Vendor isolation**: Vendors can only see their own quotes and assigned RFQs

### Token Information
JWT tokens include:
- `sub`: User ID
- `companyId`: Assigned company (null for Super Admin)
- `email`: User email
- `role`: User role
- `name`: Display name

---

## Testing Scenarios

### 1. Super Admin Testing
- Login with Super Admin credentials
- Verify access to all companies
- Test user management features
- Check system monitoring access

### 2. Company Admin Testing
- Login with Company Admin credentials
- Verify access only to assigned company
- Test user management within company
- Check budget and reporting features

### 3. Project Manager Testing
- Login with Project Manager credentials
- Create and manage RFQs
- Evaluate vendor quotes
- Generate POs from approved quotes

### 4. Finance Manager Testing
- Login with Finance Manager credentials
- Approve/reject POs
- Process invoices
- Monitor budgets and payments

### 5. Vendor Testing
- Login with Vendor credentials
- Submit quotes for RFQs
- Update vendor profile
- Submit invoices for completed work

### 6. Viewer Testing
- Login with Viewer credentials
- Verify read-only access
- Check report viewing capabilities
- Confirm no modification permissions

---

## Quick Login Reference

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@rishabhvendorconnect.com | SuperAdmin@123 |
| Company Admin | admin@rishabhdevelopers.com | CompanyAdmin@123 |
| Company Admin | admin@premiumestates.com | CompanyAdmin@123 |
| Project Manager | pm@rishabhdevelopers.com | ProjectManager@123 |
| Project Manager | pm@premiumestates.com | ProjectManager@123 |
| Finance Manager | finance@rishabhdevelopers.com | FinanceManager@123 |
| Finance Manager | finance@premiumestates.com | FinanceManager@123 |
| Vendor | vendor@steelconstruction.com | Vendor@123 |
| Vendor | vendor@electricalworks.com | Vendor@123 |
| Vendor | vendor@plumbingpro.com | Vendor@123 |
| Viewer | viewer@rishabhdevelopers.com | Viewer@123 |

---

## Support

For login issues or password resets, contact the system administrator or use the Super Admin account to manage user accounts.

**Note**: These are development/testing credentials. In production, ensure all passwords are changed and follow your organization's security policies.
