# Habitoid 🎯⚡

> Transform your daily routines into powerful habits with AI-powered insights, gamification, and a loveable companion named Slash!

![Habitoid Banner](client/public/logo.png)

## 🎬 Demo

![App Demo](client/public/demo/habitoid-demo.webp)

## 🎮 Live Demo

**[Try Habitoid](https://habitoid.onrender.com)** *(deployed on Render)*

---

## ✨ Features

### 📋 Core Habit Tracking
- Create, track, and manage daily habits with intuitive UI
- Flexible frequency options (daily, weekdays, custom)
- Category-based organization with icons and colors
- GitHub-style contribution grid visualization

### ⏱️ Focus Timer (Pomodoro)
- Customizable focus and break durations (1-180 min)
- Link focus sessions to specific habits
- Ambient sounds (Lo-Fi, Rain, Nature, Fireplace)
- Focus mode with immersive timer display

### 🤖 AI-Powered Features
- Smart habit suggestions based on your patterns
- Weekly AI performance analysis
- Personalized coaching tips
- Predictive insights (best/worst days)

### 🏆 Gamification System
- Earn XP for completing habits
- Level up system with Slash evolution
- 20+ achievement badges to unlock
- Streak multipliers (up to 2.5x XP)
- Weekly challenges

### 👥 Social Features
- Add friends by username
- Activity feed
- Global leaderboard
- Share your stats

### 🎯 Goals & Habit Stacking
- Daily/weekly goal targets
- Habit stacking (After X, do Y)
- Personal milestones tracking

### 🔔 Notifications
- Browser push notifications
- Habit reminders
- Streak alerts
- Focus session completion alerts

### 📊 Analytics & Insights
- Detailed performance charts
- Category breakdown
- Best performing day analysis
- CSV export

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | TailwindCSS, Shadcn/UI, Framer Motion |
| Backend | Express.js, TypeScript |
| Database | SQLite with Drizzle ORM |
| Auth | Passport.js (Local, Google, GitHub OAuth) |
| AI | OpenAI API |
| Mobile | Capacitor (Android/iOS ready) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/habitoid.git
cd habitoid

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Open http://localhost:5000
```

---

## 🔧 Environment Variables

```env
# Required
SESSION_SECRET=your-secret-key-here

# Optional - OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Optional - AI Insights
OPENAI_API_KEY=your-openai-api-key

# Optional - Email
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

---

## 📁 Project Structure

```
habitoid/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities (gamification, notifications)
│   └── public/           # Static assets
├── server/               # Express backend
│   ├── services/         # AI, Email services
│   ├── routes.ts         # API endpoints
│   └── storage.ts        # Database operations
├── shared/               # Shared types & schema
└── android/              # Capacitor Android app
```

---

## 📱 Mobile App

Habitoid is built with Capacitor for native mobile apps.

### Build Android APK
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

### Build iOS (requires Mac)
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

---

## 🌐 Deployment

### Render (Recommended)
1. Connect your GitHub repo to Render
2. Set build command: `npm run build`
3. Set start command: `npm run start`
4. Add environment variables

### Docker
```bash
docker build -t habitoid .
docker run -p 5000:5000 habitoid
```

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push schema to database |

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Credits

- [Shadcn/UI](https://ui.shadcn.com/) - Component library
- [Lucide Icons](https://lucide.dev/) - Icon set
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [DiceBear](https://dicebear.com/) - Avatar generation

---

<div align="center">
  Made with ❤️ and ⚡ by the Habitoid Team
  
  **Meet Slash, your habit-building companion!**
</div>
