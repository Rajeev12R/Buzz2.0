# Buzz 2.0 - Next-Gen Networking Platform

Buzz is a professional social networking application designed for seamless connectivity, real-time interactions, and a premium user experience.

## Key Features

- **Real-time Connectivity**: Powered by Socket.io for instantaneous messaging and activity updates.
- **Cloud-Native Architecture**: Fully migrated to **MongoDB Atlas** for high availability and global scalability.
- **Premium UI/UX**:
  - **Glassmorphic Toaster**: Modern, translucent notification system with smooth scale-and-slide animations.
  - **Responsive Design**: Optimized for all devices with a sleek dark/light mode.
- **Dynamic Content**:
  - **Stories**: 24-hour expiring visual updates.
  - **Social Feed**: Interactive posts with likes and comments.
- **Profile Management**: Custom avatars (Cloudinary), follow systems, and detailed user profiles.

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS, React Hot Toast, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: MongoDB Atlas (Mongoose).
- **Media**: Cloudinary (Image hosting).
- **Authentication**: JWT & Cookie-parser.

## Setup & Installation

### Prerequisites

- Node.js (v18+)
- Local or Atlas MongoDB Cluster
- Cloudinary Account

### 1. Clone & Install

```bash
git clone https://github.com/Rajeev12R/Buzz2.0.git
cd Buzz2.0
```

### 2. Environment Configuration

Create a `.env` file in the `/server` directory:

```env
PORT=3000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Start Development

**Backend:**

```bash
cd server
npm install
npm start
```

**Frontend:**

```bash
cd client
npm install
npm run dev
```

---
