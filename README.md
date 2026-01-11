# Mobile Recharge System

A complete 14-page enterprise-grade mobile recharge application with React frontend and Node.js backend.

## Project Structure

```
mobile recharge/
├── frontend/                 # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # All React Components (14 pages)
│   │   │   ├── Login.js
│   │   │   ├── RechargesDashboard.js
│   │   │   ├── PlanDetailsPage.js
│   │   │   ├── RechargeStatusPage.js
│   │   │   ├── RechargeHistoryPage.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── HelpSupportPage.js
│   │   │   ├── NotificationsPage.js
│   │   │   ├── UsageAnalyticsPage.js
│   │   │   ├── RefundsPage.js
│   │   │   ├── SettingsPage.js
│   │   │   └── InfoPagesContainer.js
│   │   ├── App.js           # Main App Component
│   │   └── index.js         # React Entry Point
│   └── package.json         # Frontend Dependencies
│
└── backend/                 # Node.js Backend
    ├── server.js           # Express Server
    ├── database.js         # MongoDB Connection
    ├── schemas.js          # Main Schemas
    ├── supportTicketSchema.js
    ├── notificationSchema.js
    ├── authRoutes.js       # Authentication Routes
    ├── adminRoutes.js      # Admin Management Routes
    ├── supportRoutes.js    # Support System Routes
    ├── notificationsRoutes.js
    ├── authMiddleware.js   # JWT Middleware
    ├── roleMiddleware.js   # Role-based Access
    └── package.json        # Backend Dependencies
```

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Features

### 14 Complete Pages
1. **Login** - OTP Authentication
2. **Dashboard** - Smart Recharge Plans
3. **Plan Details** - Confirmation Page
4. **Recharge Status** - Transaction Status
5. **History** - Recharge History
6. **Admin** - Management Dashboard
7. **Support** - Help & Tickets
8. **Notifications** - Alerts & Reminders
9. **Usage Analytics** - Data Tracking
10. **Refunds** - Failed Recharge Tracking
11. **Settings** - User Preferences
12. **Compliance** - Privacy & Audit
13. **System Status** - Health Monitoring
14. **About** - App Information

### Enterprise Features
- Role-based access (Admin/User)
- MongoDB integration
- JWT authentication
- Real-time notifications
- Usage analytics
- Support ticket system
- Refund management
- Multi-language support

## Database
MongoDB Atlas: `ramyakrishna.edroqry.mongodb.net`
Database: `mobile-recharge`

## API Endpoints
- Authentication: `/auth/*`
- Admin: `/admin/*`
- User: `/user/*`
- Support: `/support/*`
- Notifications: `/notifications/*`

## Technology Stack
- **Frontend**: React 18, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT + OTP
- **Styling**: Inline CSS (Mobile-first)