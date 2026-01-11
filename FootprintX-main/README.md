# 🌱 FootprintX - Carbon Footprint Tracking Platform

A comprehensive carbon footprint tracking application that helps individuals measure and reduce their environmental impact, covering both physical and digital sustainability.

## ✨ Features

### Core Functionality
- **Daily Carbon Footprint Tracking** - Track transportation, energy, waste, shopping, and air travel
- **Digital Carbon Footprint** - Monitor internet usage, streaming, cloud storage, emails, and social media
- **AI-Powered Chatbot** - NLP-based eco-assistant for sustainability questions and app navigation
- **Personalized Suggestions** - AI-based recommendations for reducing your carbon footprint
- **Carbon Offset Recommendations** - Verified platforms and offset types
- **Interactive Dashboard** - Visualize your progress with charts and trends
- **Community Leaderboard** - Compare your efforts with other users
- **Complaint Portal** - Submit environmental concerns and tweet about climate issues
- **Data Export** - Download CSV and PDF reports for personal or professional use
- **Tips & Blog** - Educational content and sustainability insights

### Technical Features
- **Progressive Web App (PWA)** - Installable on mobile devices
- **AI-Powered Chatbot** - Natural language processing for sustainability guidance
- **Contextual Awareness** - Bot understands user's carbon footprint data
- **Dark Mode Support** - Toggle between light and dark themes
- **Mobile Responsive** - Optimized for all device sizes
- **Real-time Data** - Live updates and calculations
- **User Authentication** - Secure login and registration
- **Data Persistence** - Save and track your progress over time

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **Sonner** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Lightweight database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend/project
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `frontend/project/.next`
4. Deploy!

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy!

### Database
- **Development**: SQLite (included)
- **Production**: PostgreSQL (recommended)

## 📱 PWA Features

The app is configured as a Progressive Web App with:
- **Installable** - Add to home screen on mobile devices
- **Offline Support** - Basic functionality without internet
- **App-like Experience** - Full-screen mode
- **Push Notifications** - (Future feature)

## 🎨 UI/UX Features

- **Modern Design** - Clean, intuitive interface
- **Dark Mode** - Toggle between light and dark themes
- **Responsive Layout** - Works on all screen sizes
- **Accessibility** - WCAG compliant components
- **Smooth Animations** - Enhanced user experience

## 📊 Carbon Calculation Methods

### Physical Carbon Footprint
- **Transportation**: 0.2 kg CO₂e per km per day
- **Energy**: 0.5 kg CO₂e per kWh per month
- **Waste**: 0.7 kg CO₂e per kg per week
- **Shopping**: 0.1 kg CO₂e per $ per month
- **Flights**: 90 kg CO₂e per hour per year

### Digital Carbon Footprint
- **Internet Usage**: 0.05 kg CO₂e per GB per month
- **Streaming**: 0.1 kg CO₂e per hour per month
- **Cloud Storage**: 0.02 kg CO₂e per GB stored
- **Emails**: 0.0004 kg CO₂e per email per month
- **Video Calls**: 0.15 kg CO₂e per hour per month
- **Social Media**: 0.08 kg CO₂e per hour per month

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Calculations
- `POST /api/calculate` - Save calculation
- `GET /api/calculate/history` - Get user history

### Complaints
- `POST /api/complain` - Submit complaint

### Chatbot
- `POST /api/chatbot/process` - Process user message and return bot response
- `GET /api/chatbot/context` - Get user context for chatbot

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard data

## 🌍 Environmental Impact

This platform helps users:
- **Track** their carbon footprint across multiple categories
- **Understand** the environmental impact of their daily choices
- **Reduce** emissions through personalized suggestions
- **Offset** remaining emissions through verified programs
- **Share** knowledge and concerns about climate issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Carbon calculation methods based on EPA and IPCC guidelines
- UI components from Shadcn/ui
- Icons from Lucide React
- Inspiration from climate action initiatives



**Made by Bhoomi Jaiswal 🌱 for a sustainable future**
