# Email Campaign Platform

A full-featured email campaign management platform built with React.js and Node.js. This application allows users to create, manage, and track email campaigns with detailed analytics.

## Features

- 📧 Email Campaign Management
  - Create and manage email campaigns
  - Rich text editor for email content
  - File attachments support
  - CSV recipient list upload
  - Campaign scheduling
  
- 📊 Analytics & Tracking
  - Real-time email tracking
  - Open and click rates
  - Detailed campaign analytics
  - Interactive charts and graphs
  
- 👥 User Management
  - JWT-based authentication
  - User registration and login
  - Secure password handling
  
- 🔧 Technical Features
  - Rate limiting and email throttling
  - Background job processing
  - MongoDB database
  - Responsive UI with Tailwind CSS

## Prerequisites

Before running the application, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd email-campaign-platform
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file and update with your configurations
cp .env.example .env
```

Update the `.env` file with your configurations:
```env
MONGODB_URI=mongodb://localhost:27017/email-campaign
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com
API_URL=http://localhost:5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

## Running the Application

### 1. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Start MongoDB (command may vary based on your installation)
mongod
```

### 2. Start the Backend Server
```bash
# In the backend directory
npm run dev
```
The backend server will start on http://localhost:5000

### 3. Start the Frontend Development Server
```bash
# In the frontend directory
npm run dev
```
The frontend application will start on http://localhost:3000

## Project Structure

```
.
├── backend/
│   ├── config/         # Database and other configurations
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── workers/        # Background job workers
│   └── app.js         # Main application file
│
└── frontend/
    ├── src/
    │   ├── components/ # React components
    │   ├── pages/      # Page components
    │   ├── store/      # State management
    │   ├── lib/        # Utilities and helpers
    │   └── App.jsx    # Root component
    └── index.html     # HTML template
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login user

### Campaigns
- `GET /api/v1/campaigns` - List all campaigns
- `POST /api/v1/campaigns` - Create a new campaign
- `GET /api/v1/campaigns/:id` - Get campaign details
- `PATCH /api/v1/campaigns/:id` - Update campaign
- `DELETE /api/v1/campaigns/:id` - Delete campaign
- `POST /api/v1/campaigns/:id/send` - Send campaign

## Development

### Backend Development
The backend is built with:
- Express.js for API routing
- MongoDB with Mongoose for data storage
- JWT for authentication
- Bull for job processing
- Nodemailer for email sending

### Frontend Development
The frontend is built with:
- React.js with Hooks
- Tailwind CSS for styling
- React Router for navigation
- Zustand for state management
- Chart.js for analytics visualization
- React Hook Form for form handling

## Production Deployment

### Backend Deployment
1. Update environment variables for production
2. Set up MongoDB production database
3. Configure email service credentials
4. Set up process manager (PM2 recommended)

### Frontend Deployment
1. Build the frontend application:
```bash
cd frontend
npm run build
```
2. Deploy the built files from `dist` directory

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.