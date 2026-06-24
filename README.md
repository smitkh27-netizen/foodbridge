# FoodBridge 🍱

FoodBridge is a modern, full-stack web application designed to manage food donations and social welfare. It connects food donors (restaurants, hotels, individuals), NGOs, and volunteers to reduce food waste and support those in need.

## 🚀 Key Features

- **Role-Based Dashboards**: Tailored experiences for Donors, NGOs, Volunteers, and Admins.
- **Real-Time Notifications**: Instant alerts for new donations and assignments via Socket.IO.
- **Interactive Marketplace**: Map-based view for NGOs to browse available donations.
- **Volunteer Management**: Efficient assignment and tracking of pickup/delivery tasks.
- **Impact Analytics**: Visualization of positive social impact and resource distribution.
- **Secure Auth**: JWT-based authentication with role-based access control.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO.
- **Storage**: Cloudinary (for item images).

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for image uploads)

### 2. Environment Setup

#### Backend (`/backend/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLIENT_URL=http://localhost:3000
```

#### Frontend (`/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Installation & Running

#### Start Backend
```bash
cd backend
npm install
npm start
```

#### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 👥 Demo Accounts
You can use the following accounts for testing (once registered):
- **Donor**: restaurant@test.com
- **NGO**: hope@ngo.org
- **Volunteer**: alex@volunteer.me
- **Admin**: admin@foodbridge.in

## 📄 License
This project is licensed under the MIT License.
