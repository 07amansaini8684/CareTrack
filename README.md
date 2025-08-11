# 🏥 CareTrack - Healthcare Worker Management System

## 🔐 Demo Credentials

### **Manager Account**
- **Email:** `manager@example.com`
- **Password:** `Manager@123`

### **Care Worker Account**
- **Email:** `careworker@example.com`
- **Password:** `Care@123`

> **Note:** These are demo accounts for testing purposes. In production, use secure authentication methods.


Hi there! 👋 

I want to express my deepest gratitude for this incredible opportunity to build something meaningful. This project represents my commitment to creating beautiful, professional, and user-friendly applications that make a real difference in healthcare operations.

I've poured my heart into making CareTrack as beautiful and professional as possible, following all the recommended best practices and technologies. The application is built on a solid foundation of modern web technologies, ensuring scalability, performance, and maintainability.

## 🚀 Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router for optimal performance
- **TypeScript** - Type-safe development experience
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Ant Design** - Professional UI component library for consistent design

### **Backend & Database**
- **Prisma ORM** - Type-safe database client and migrations
- **Neon PostgreSQL** - Serverless Postgres for scalable data storage
- **Next.js API Routes** - Full-stack development with built-in API endpoints

### **Authentication & Security**
- **Auth0** - Enterprise-grade authentication and authorization
- **Role-based Access Control** - Manager and Care Worker permissions
- **Secure API endpoints** - Protected routes and data access

### **Data Visualization & Analytics**
- **ApexCharts** - Interactive charts and data visualization
- **Ant Design Tables** - Professional data tables with sorting and filtering
- **Real-time Updates** - Live data synchronization

### **Development Experience**
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Hot Reload** - Fast development iteration



## 📋 Initial Development Challenges

During the initial development phase, I encountered some challenges with Auth0's newest version (released just 1-2 weeks ago). The documentation was still being updated, which made integration slightly more complex than expected. However, I successfully managed to implement the authentication system and ensure it works seamlessly with the application.

The experience taught me valuable lessons about working with cutting-edge technologies and adapting to rapid updates in the development ecosystem.

## 👨‍⚕️ How CareTrack Works - Care Worker Experience

### **Authentication & Access**
- **Login/Signup**: Care workers can authenticate using Auth0 with the provided demo credentials
- **Demo Data**: The demo care worker account comes pre-loaded with extensive data for comprehensive dashboard visualization
- **Role-based Access**: Secure access control ensures workers only see their relevant information

### **Location & Geofencing**
- **GPS Permission**: Upon login, users are prompted to share their geolocation for real-time tracking
- **Interactive Map**: Real-time location display with visual representation of work areas
- **Geofence Monitoring**: Continuous tracking of user position relative to assigned work locations

### **Shift Management**
- **Smart Shift Starting**: Users can start shifts from anywhere (currently implemented for convenience)
- **Location Selection**: Choose from manager-assigned work locations
- **Note Taking**: Add shift notes and observations during work
- **Automatic Calculations**: Work hours, location data, and performance metrics are automatically calculated

### **Advanced Testing Features**
- **Test Simulation Mode**: Built-in simulation system for testing geofencing functionality
- **Rapid Coordinate Changes**: Simulates user movement within and outside work radius
- **Real-time Notifications**: Instant alerts when entering/leaving designated work areas
- **Bounce Detection**: Monitors rapid in/out movements for quality assurance

### **Data Visualization & Analytics**
- **Work Hours Charts**: Interactive charts showing daily and monthly work patterns
- **Performance Metrics**: Comprehensive statistics including total shifts, hours worked, and averages
- **Shift History**: Detailed table of previous shifts with timestamps and locations
- **Real-time Updates**: Live data synchronization from the database

### **Current Implementation Notes**
> **Geofence Flexibility**: Currently, users can start shifts from outside the designated radius for testing convenience. This can be easily restricted to require users to be within the work area for shift initiation.

---

## 🧪 **INNOVATIVE SIMULATION SYSTEM** 🧪

> **🚀 Why This Feature Exists**: The test simulation feature was created out of necessity during development. Since I was not in a position to physically test the geofencing functionality by moving around different locations, I implemented a comprehensive simulation system that:
> 
> **📍 Core Functionality:**
> - **Coordinate Calculation**: Dynamically calculates user coordinates based on manager-created location data
> - **Movement Simulation**: Rapidly changes coordinates to simulate movement within/outside the work radius
> - **Real-time Testing**: Provides instant testing of the bounce detection and notification systems
> - **Comprehensive Coverage**: Allows thorough testing of geofencing logic without physical movement
> 
> **💡 The Result**: This simulation system makes the development and testing process much more convenient and comprehensive, especially when physical testing isn't feasible.
> 
> **🎯 Key Benefit**: You can now test complex geofencing scenarios from anywhere in the world!

---

## 👨‍💼 **Manager Dashboard & Features**

### **Authentication & Role-Based Access**
- **Automatic Redirection**: Users are automatically redirected to the manager dashboard after database role verification
- **Role Checking**: System fetches user data from database and checks if the user role is "MANAGER"
- **Secure Access**: Only users with manager privileges can access the manager dashboard

### **Dashboard Layout - Three Main Sections**

#### **📊 First Section - Statistics Overview**
- **Comprehensive Stats**: Manager sees all key performance metrics at a glance
- **Real-time Data**: Live statistics updated from the database
- **Visual Metrics**: Clean, easy-to-read statistics display

#### **📍 Second Section - Location Management**
- **Location Display**: Shows all locations the manager has created
- **Create New Location**: Icon button to add new work locations
- **Manual Coordinate Input**: Manager must manually enter coordinates (latitude/longitude)
- **Future Enhancement**: Planned feature to select coordinates from map (currently manual for simplicity)
- **Geofence Setup**: Each location includes radius settings and operational parameters

#### **👥 Third Section - Care Worker Management**
- **Live Worker List**: Real-time display of all care workers
- **Status Updates**: Shows when worker information was last updated
- **Last Login Tracking**: Displays last login timestamps for each worker
- **Worker Details**: Access to individual worker profiles and performance data

### **Data Tables & Analytics**

#### **📋 Shifts Table**
- **Interactive Rows**: Manager can tap/click on each table row
- **Detailed View**: Clicking reveals complete shift information
- **Comprehensive Data**: Full shift details including timestamps, locations, and worker notes
- **Sorting & Filtering**: Easy data organization and search capabilities

#### **📈 Analytics Charts**
- **Shift Analytics**: Visual representation of shift patterns and trends
- **Performance Metrics**: Charts showing worker productivity and time management
- **Data Visualization**: Easy-to-understand graphical data representation
- **Real-time Updates**: Charts update automatically with new data

### **Current Implementation Notes**
> **Coordinate Input**: Currently requires manual coordinate entry for simplicity. Future enhancement will include map-based coordinate selection for better user experience.

> **Dashboard Flow**: The entire dashboard is designed for efficiency - managers can quickly assess operations, manage locations, monitor workers, and analyze performance all from one centralized interface.

## 🚀 **Getting Started & Installation**

### **Prerequisites**
- Node.js 18+ and npm/yarn
- PostgreSQL database (Neon recommended)
- Auth0 account for authentication

### **Quick Setup**
```bash
# Clone the repository
git clone [https://github.com/07amansaini8684/CareTrack.git]
cd caretrack

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### **Environment Variables**
```env
DATABASE_URL="your-neon-postgres-url"
AUTH0_SECRET="your-auth0-secret"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://your-domain.auth0.com"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret" 
```

// i don't think i should add the cred here hbut this is the structure of auth part and db

---

## 🎯 **Project Structure**
```
caretrack/
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Database and utilities
│   └── assets/        # Images and static files
├── prisma/            # Database schema and migrations
└── public/            # Static assets
```

---

## 🌟 **Final Words & Gratitude**

### **Project Reflection**
I've poured my heart and soul into building CareTrack exactly as you instructed. This project represents my commitment to creating professional, beautiful, and functional applications that make a real difference in healthcare operations.

### **What I've Built**
- **Professional UI/UX**: Modern, responsive design that healthcare workers will love
- **Robust Backend**: Secure, scalable architecture with real-time capabilities
- **Innovative Features**: Smart geofencing, simulation systems, and comprehensive analytics
- **Quality Code**: Clean, maintainable, and well-documented implementation

### **My Commitment to Excellence**
I've tried to build this application as beautifully and professionally as possible, following all your recommendations and best practices. Every feature, every line of code, and every design decision was made with quality and user experience in mind.

### **Open to Feedback & Growth**
**If you love this project** - It would be an honor to continue working with you on future enhancements and improvements.

**If you see areas for improvement** - Please let me know! I'm always eager to learn and grow. Your feedback will help me become a better developer for future projects.

**If you don't like aspects of this project** - I genuinely want to know what could be better. Honest feedback is how I improve and deliver even better results next time.

### **Thank You**
Once again, thank you for this incredible opportunity. Working on CareTrack has been both challenging and rewarding, and I hope the final result meets or exceeds your expectations.

---

## 📞 **Let's Connect**
I'm excited about the possibility of working together again! Whether it's enhancing CareTrack or building something completely new, I'm ready to bring your vision to life with the same dedication and quality.

**Ready for the next project?** Let's build something amazing together! 🚀✨

---

🌐 Live Demo
If you’d like to try the product, you can access it here:
🔗 CareTrack Live - https://care-track-eight.vercel.app/

🔐 Demo Credentials
Manager Account
Email: manager@example.com

Password: Manager@123

Care Worker Account
Email: careworker@example.com

Password: Care@123

⚠️ Important:
If you log in as a Care Worker, do not click on the "Request to Manager" option under your profile unless you intentionally want to be promoted to Manager. Once promoted, there’s no way to revert back to a Care Worker role.

*Built with care and Next.js*
