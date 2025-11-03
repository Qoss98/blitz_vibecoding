# 🎯 Training Program Scheduler

> A modern, full-stack web application for creating and managing structured training programs with beautiful scheduling interfaces, authentication, and cloud-powered data persistence.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19.1-blue)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)

---

## 🚀 Overview

**Training Program Scheduler** is a comprehensive solution designed for talent managers to effortlessly create, manage, and distribute structured two-month training programs. Built with modern web technologies and clean architecture principles, this application transforms the manual process of program creation into an intuitive, digital experience.

### What We've Built

This application was developed as a competition project to solve real-world training management challenges. We combined cutting-edge technology with thoughtful UX design to deliver a production-ready solution that scales from prototype to enterprise use.

---

## ✨ Key Features

### 🎨 **Beautiful & Intuitive Interface**
- **Modern Design System**: Custom Createment-branded styling with gradient themes, dark mode optimization, and high-contrast accessibility
- **Responsive Layout**: Mobile-first design that works seamlessly across all devices
- **Interactive Grid View**: Visual week-by-week calendar with drag-and-select functionality
- **Professional Print Export**: One-click PDF generation with perfect A4 landscape formatting

### ⚡ **Powerful Scheduling Tools**
- **Auto-Generated Calendars**: Automatically creates a complete 8-week schedule based on start date
- **Bulk Selection & Editing**: Select multiple days and apply training details simultaneously
- **Smart Field Management**: 
  - Subject/topic customization
  - Multiple delivery modalities (On-site, Online, Custom)
  - Trainer assignment
  - Custom location support
  - Rich descriptions and notes
- **Template System**: Save frequently used training configurations for instant reuse

### 🎯 **Smart Features**
- **Dutch Holiday Detection**: Automatically fetches and highlights Dutch national holidays via public API
- **Weekend Recognition**: Intelligent weekend detection with visual distinction
- **Multi-Program Management**: Talent managers can create and oversee multiple trainee programs
- **Real-Time Data Persistence**: Cloud database integration with localStorage fallback

### 🔐 **Authentication & Security**
- **Role-Based Access Control**: Separate interfaces for Talent Managers and Trainees
- **Supabase Auth Integration**: Secure email/password and magic link authentication
- **Protected Routes**: Automatic redirects based on user roles
- **Session Management**: Persistent authentication across browser sessions

### 💾 **Data Architecture**
- **Cloud-First with Fallback**: Supabase integration with graceful localStorage degradation
- **Normalized Database Schema**: Clean PostgreSQL structure with proper relationships
- **UUID-Based IDs**: Industry-standard unique identifiers for all entities
- **Optimized Performance**: Intelligent caching and prefetching strategies

---

## 🏗️ Architecture Highlights

### **Clean Architecture Principles**
```
src/
├── dal/                    # Data Access Layer - pure HTTP functions
├── features/               # Feature-based organization
│   ├── auth/
│   │   └── containers/    # Data orchestration
│   └── schedule/
│       ├── components/    # Presentational components
│       └── containers/    # Business logic
├── lib/                   # Shared utilities
│   ├── supabase/          # Database abstractions
│   └── storage.ts         # Storage abstraction layer
├── components/            # Reusable UI primitives
└── types/                 # TypeScript definitions
```

### **Design Patterns**
- **Separation of Concerns**: Clear boundaries between data, logic, and presentation
- **Container/Presentational Split**: Logic containers drive dumb components
- **Storage Abstraction**: Unified API for multiple storage backends
- **Type Safety**: Comprehensive TypeScript coverage with strict mode
- **Error Boundaries**: Graceful error handling with user-friendly fallbacks

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - Latest stable version with modern hooks and concurrent features
- **TypeScript 5** - Full type safety with strict mode
- **Vite 7** - Lightning-fast build tool and HMR
- **TailwindCSS 4** - Utility-first styling with custom theme
- **React Router v7** - Declarative routing and navigation
- **React Query (TanStack)** - Powerful server state management

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Built-in authentication system
- **Row-Level Security** - Database-level access control

### **Development Tools**
- **ESLint 9** - Code quality and consistency
- **TypeScript ESLint** - Enhanced type-aware linting
- **Vite TSConfig Paths** - Clean import aliases
- **Cursor AI** - AI-powered development workflow

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cursor-programming-react-vite-template
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Database (Optional)

The application works with or without a database. Choose one option:

#### Option 1: Use Shared Database (Recommended)
```bash
cp .env.example .env
```
The `.env.example` file already contains pre-configured database credentials. Your app will automatically connect to the shared Supabase database.

#### Option 2: Use Your Own Database
Follow the detailed instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to set up your own Supabase project.

#### Option 3: Work Without Database
Skip this step entirely! The app automatically falls back to localStorage for data persistence.

### 4. Start Development Server

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`

---

## 📚 Usage Guide

### For Talent Managers

1. **Sign In**: Use email/password authentication or request a magic link
2. **View Plans**: See an overview of all training programs you've created
3. **Create New Program**: 
   - Set start date and duration
   - Define trainee information
   - Customize program metadata (cohort, title, remarks)
4. **Schedule Training Days**:
   - View the automatically generated calendar
   - Select multiple days for bulk editing
   - Fill in training details (subject, modality, trainer, etc.)
   - Use templates for consistency
5. **Export PDF**: Generate a professional print-ready document
6. **Manage Templates**: Save common training configurations for reuse

### For Trainees

1. **Sign In**: Authenticate with your assigned email
2. **View Schedule**: See your personalized training calendar
3. **Print or Export**: Download your schedule as a PDF

---

## 🗂️ Project Structure

```
cursor-programming-react-vite-template/
├── src/
│   ├── components/          # Shared UI components
│   │   ├── error-boundary.tsx
│   │   ├── modal.tsx
│   │   └── role-guard.tsx
│   ├── dal/                 # Data Access Layer
│   │   ├── auth.ts
│   │   └── programs.ts
│   ├── features/            # Feature modules
│   │   ├── auth/
│   │   │   └── containers/  # Auth pages & providers
│   │   ├── plans/
│   │   │   └── containers/  # Plans overview
│   │   └── schedule/
│   │       ├── components/  # Schedule UI components
│   │       └── containers/  # Schedule business logic
│   ├── lib/                 # Shared libraries
│   │   ├── storage.ts       # Storage abstraction
│   │   └── supabase/        # Database utilities
│   ├── styles/              # Custom styling
│   │   └── createment-theme.css
│   ├── types/               # Type definitions
│   │   ├── database.ts
│   │   └── schedule.ts
│   ├── utils/               # Utility functions
│   │   ├── date.ts
│   │   └── holidays.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/          # Database schema
├── public/                  # Static assets
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🎨 Design System

### **Color Palette**
- Primary: Blue gradient (`#0B35F4`)
- Secondary: Purple accents (`#6B46C1`)
- Background: Dark gray scale (`#121417` to `#ffffff`)
- Semantic: Success, danger, and neutral variants

### **Typography**
- Display: Bold, confident system fonts
- Body: System UI stack for excellent readability
- Scale: Mobile-first responsive sizing

### **Components**
- Reusable card patterns
- Gradient buttons with hover states
- Consistent spacing system
- Accessibility-first interactive elements

---

## 🧪 Testing Strategy

The application includes:
- **Type Safety**: TypeScript strict mode catches errors at compile time
- **Runtime Validation**: Error boundaries for graceful failures
- **User Feedback**: Loading states and error messages
- **Accessibility**: Semantic HTML and ARIA labels

---

## 🚢 Deployment

The application is optimized for deployment on:
- **Vercel** - Zero-config deployment with automatic optimizations
- **Netlify** - JAMstack-friendly hosting
- **Traditional Hosting** - Static files from `dist/` folder

### Build for Production

```bash
npm run build
```

This generates an optimized production build in the `dist/` directory.

---

## 🤝 Contributing

This project was developed as a competition entry. While contributions are welcomed:
1. Follow the existing code style
2. Maintain TypeScript strict mode compliance
3. Write clear, self-documenting code
4. Test thoroughly before submitting

---

## 📖 Additional Documentation

- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Detailed database setup guide
- [projectbeschrijving.md](projectbeschrijving.md) - Original project requirements

---

## 🏆 Competition Highlights

### **What Makes This Project Stand Out**

1. **Production-Ready Code**: Not just a prototype, but a fully functional application ready for real-world use
2. **Modern Architecture**: Clean, scalable structure following industry best practices
3. **User-Centered Design**: Intuitive interface that requires minimal learning
4. **Developer Experience**: Excellent TypeScript support, error handling, and code organization
5. **Performance**: Optimized rendering, smart caching, and efficient data loading
6. **Accessibility**: Semantic HTML, proper ARIA labels, and keyboard navigation
7. **Responsive**: Works perfectly on mobile, tablet, and desktop
8. **Robust**: Comprehensive error handling and graceful degradation
9. **Extensible**: Easy to add new features thanks to clean architecture
10. **Beautiful**: Professional design that reflects modern web standards

### **Technical Excellence**
- ✅ Full TypeScript coverage
- ✅ Clean architecture with clear separation of concerns
- ✅ Cloud database with localStorage fallback
- ✅ Role-based authentication and authorization
- ✅ Responsive design system
- ✅ Print-optimized PDF export
- ✅ Real-time data synchronization
- ✅ Comprehensive error handling
- ✅ Production-ready build system

---

## 📞 Support & Resources

For questions or issues:
- Check the [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for database setup
- Review the inline code comments for implementation details
- Consult the project structure section for navigation

---

## 📄 License

This project is developed for competition purposes. See individual file headers for specific licensing.

---

## 🙏 Acknowledgments

- **Createment** - For the design system and branding
- **Supabase** - For the excellent backend infrastructure
- **Vite** - For the incredible developer experience
- **TailwindCSS** - For the utility-first CSS approach
- **React Team** - For the amazing framework

---

<div align="center">

**Built with ❤️ for the competition**

[⬆ Back to Top](#-training-program-scheduler)

</div>
