# CairCompanion

A **Progressive Web App (PWA)** for patients that provides voice and text-based interaction along with health data tracking and caregiver management.

## Features

- **Voice Conversation** - Real-time voice interaction via WebSocket with interrupt handling
- **Text Chat** - Alternative text-based communication
- **Health Dashboard** - View medical conditions, vitals, medications, and care plans
- **Health Trackers** - Track vitals, medication, exercise, diet, sleep, and mood
- **Caregiver Management** - Send/receive caregiver requests and manage connections
- **Multi-Organization Support** - Switch between enrolled healthcare organizations
- **PWA Support** - Installable on desktop, Android, and iOS

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CairCompanion_PWA
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env-example .env
   ```

4. Configure your environment variables in `.env`

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Project Structure

```
src/
├── assets/          # Static assets (images, icons)
├── components/      # Reusable UI components
│   ├── layout/      # Layout components
│   └── ui/          # UI primitives
├── config/          # Configuration files
├── contexts/        # React contexts (Auth, Organization)
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles

public/              # Public assets
```

Private - All rights reserved.
