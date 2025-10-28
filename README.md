# HopeLoom - Mental Wellness Platform

A comprehensive mental health and wellness application built with React, Firebase, and modern animations.

## 🌟 Features

### 🧠 Mental Health Assessments
- Depression (PHQ-9)
- Anxiety (GAD-7)
- Stress Assessment
- PTSD Screening
- Real-time scoring and severity analysis
- Results saved to Firebase Firestore

### 👥 Professional Support
- Browse certified mental health professionals
- Book appointments with counselors
- Filter by specialization
- Appointment management system

### 📰 Mental Health News
- Live mental health news from News API
- Articles about depression, anxiety, therapy, and wellbeing
- Latest headlines updated in real-time

### 🔐 Authentication
- Email/Password authentication
- Google Sign-In integration
- User profiles stored in Firestore
- Secure Firebase Authentication

### � Email Notifications
- Doctors receive email when appointments are booked
- Appointment details sent automatically
- EmailJS integration for reliable delivery
- Patient contact information included

### 👤 User Profile Dashboard
- View all completed assessments
- Track assessment scores and severity levels
- View upcoming appointments
- Quick actions for new assessments and bookings

### �💾 Data Management
- User profiles with full name and email
- Assessment results with user information
- Appointment bookings with doctor assignments
- Contact form submissions
- All data stored securely in Firebase Firestore
- Doctors can view patient assessments

### 🎨 Modern UI/UX
- 3D CardSwap animations (GSAP)
- DecryptedText animations (Framer Motion)
- Responsive design with Tailwind CSS
- Smooth scroll animations
- Box breathing exercise with live animation

### 📞 Emergency Resources
- National Suicide Prevention Hotline
- Crisis Text Line
- SAMHSA Helpline
- 24/7 emergency support information

## 🚀 Technologies Used

- **React** - Frontend framework
- **Firebase** - Backend services
  - Firestore - Database
  - Authentication - User management
  - Storage - File storage
- **Tailwind CSS** - Styling
- **GSAP** - 3D animations
- **Framer Motion** - Text animations
- **Lucide React** - Icons
- **News API** - Mental health news
- **EmailJS** - Email notifications
- **Vite** - Build tool

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Somesh
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Copy your Firebase config to `firebase.js`

4. Add your News API key:
   - Get a free API key from [News API](https://newsapi.org/)
   - Update the API key in `App.jsx` (ResourcesPage component)

5. Set up EmailJS for appointment notifications:
   - Follow the detailed guide in [EMAIL_SETUP.md](./EMAIL_SETUP.md)
   - Configure your email service, template, and keys
   - Update doctor email addresses in `PROFESSIONALS_DATA`

6. Run the development server:
```bash
npm run dev
```

7. Build for production:
```bash
npm run build
```

## 🗄️ Firestore Database Structure

### Collections:

- **users**: User profiles
  - name, email, createdAt, lastLogin, role, photoURL

- **assessments**: Mental health test results
  - userId, userName, userEmail, type, assessmentType, score, maxScore, severity, responses, createdAt, completedAt

- **appointments**: Professional bookings
  - userId, userName, userEmail, userPhone, professionalId, professionalName, professionalEmail, preferredDate, preferredTime, reason, status, createdAt

- **contacts**: Support form submissions
  - userId, name, email, subject, message, status, createdAt

- **professionals**: Healthcare providers
  - name, title, specializations, bio, email, imageUrl, isActive

## 🎯 Features in Detail

### Assessment Tests
All tests include scientifically-backed questions with severity scoring:
- **PHQ-9**: 9-question depression assessment
- **GAD-7**: 7-question anxiety assessment
- **Stress Test**: 10-question stress evaluation
- **PTSD Screening**: 5-question trauma assessment

### Animations
- **3D Card Swap**: Showcases features with elastic 3D motion
- **Auto-Decrypt Text**: "HopeLoom" text animates every 4 seconds
- **Box Breathing**: Visual guide for 4-4-4-4 breathing pattern

## 🔒 Security

- Firebase Authentication for secure user management
- Google Sign-In with popup authentication
- Protected routes requiring login
- Firestore security rules (configure in Firebase Console)

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Adaptive layouts

## 🌐 Live Demo

[Add your deployed URL here]

## 👨‍💻 Author

HopeLoom Mental Wellness Platform

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- News API for mental health news
- Firebase for backend services
- GSAP for amazing animations
- Lucide React for beautiful icons
