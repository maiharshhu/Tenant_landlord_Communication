Tenant-Landlord Communication Platform
Context:
Effective communication between tenants and landlords is crucial for property management, resolving maintenance issues, and handling rent payments. However, managing multiple conversations, maintenance requests, and payment tracking can be overwhelming for both parties without a centralized system. This platform aims to streamline the communication process and improve transparency.

Project Goal:
Build a frontend-focused tenant-landlord communication platform that facilitates efficient interaction, allowing tenants to report issues, track maintenance requests, and communicate seamlessly with landlords. The goal is to create an intuitive, user-friendly interface for both tenants and landlords to stay informed and address issues promptly.

Project Structure

src/
├── components/
│ ├── Auth/
│ │ ├── SignIn.jsx
│ │ └── SignUp.jsx
│ ├── Layout/
│ │ ├── Header.jsx (Nav/Notifications)
│ │ └── ProtectedRoute.jsx
│ ├── Maintenance/
│ │ ├── MaintenanceRequestForm.jsx (Multi-step)
│ │ ├── RequestTimeline.jsx
│ │ └── AppointmentScheduler.jsx
│ ├── Messaging/
│ │ ├── ChatInterface.jsx
│ │ └── MessageBubble.jsx
│ ├── Payments/
│ │ ├── PaymentHistory.jsx
│ │ └── RentCalendar.jsx
│ └── Shared/
│ ├── Button.jsx (Tailwind-styled)
│ ├── Card.jsx (Tailwind-styled)
│ └── LanguageToggle.jsx
├── context/
│ └── AuthContext.js (Firebase Auth state)
├── pages/
│ ├── Tenant/
│ │ ├── TenantDashboard.jsx (Home/Tracking)
│ │ ├── TenantProfile.jsx
│ │ └── NewRequest.jsx
│ └── Landlord/
│ ├── LandlordDashboard.jsx (Issue Table/Filtering)
│ └── LandlordConsole.jsx (Property Management)
├── firebase/
│ └── config.js (Initialization)
├── utils/
│ └── i18n.js (i18next setup)
└── App.js (Router definition)
