# 🚀 IoT Sensor Management System

**A complete monorepo with decoupled Frontend + Backend for IoT device management and sensor monitoring.**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com)

## 🎯 Overview

This is a full-stack IoT sensor management system with:
- **Frontend**: Next.js 16 static export (AWS Amplify/S3)
- **Backend**: Express.js API (deployable anywhere)
- **Architecture**: Monorepo with decoupled services

## 📁 Folder Structure

```
iot-sensor-management/
├── 📂 backend/                 # Express.js API (port 5000)
│   ├── server.js
│   ├── package.json
│   └── README.md
│
├── 📂 frontend/                # Next.js Frontend (port 3000)
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── README.md
│
├── start-dev.bat               # Run both services (Windows)
├── start-dev.sh                # Run both services (Unix)
├── docker-compose.yml          # Docker dev environment
├── amplify.yml                 # AWS Amplify config
│
└── 📖 Documentation
    ├── README.md               (this file)
    ├── QUICKSTART.md
    ├── SETUP.md
    ├── STATUS.md
    └── API_TESTING.md
```

## 🚀 Quick Start

### Windows
```bash
start-dev.bat
```

### macOS/Linux
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Manual
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

**Open**: http://localhost:3000

## 🔌 Running Services

| Service | Port | URL | Start Command |
|---------|------|-----|---------------|
| Frontend | 3000 | http://localhost:3000 | `cd frontend && npm run dev` |
| Backend | 5000 | http://localhost:5000 | `cd backend && npm start` |

## 📡 API Base URL

- **Development**: `http://localhost:5000`
- **Production**: Update in `.env.production`

## 🧪 Quick API Test

```bash
# Health Check
curl http://localhost:5000/health

# Get Devices
curl http://localhost:5000/api/devices

# Get Sensors
curl http://localhost:5000/api/sensors
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| `QUICKSTART.md` | Fast setup guide |
| `SETUP.md` | Detailed installation & deployment |
| `API_TESTING.md` | All API endpoints with examples |
| `STATUS.md` | Current system status |
| `frontend/README.md` | Frontend details |
| `backend/README.md` | Backend details |

## 🚀 Deployment

### Frontend (AWS Amplify)
1. `cd frontend && npm run build` → creates `frontend/out/`
2. Push to GitHub
3. Connect AWS Amplify
4. Uses `amplify.yml` automatically

### Frontend (Render Static Site)
1) Build command: `bash render-build.sh`
2) Publish directory: `build`
3) Environment variable: `NEXT_PUBLIC_API_URL=https://<your-backend-host>` (point to the deployed backend service)
4) Repo root: use project root (script handles `frontend` path)

If you prefer a Docker web service instead of static hosting, use the root `Dockerfile` and pass build arg `NEXT_PUBLIC_API_URL` during build.

### Backend
Choose one:
- AWS Lambda
- AWS EC2
- Heroku
- DigitalOcean
- Azure App Service

## 🐳 Docker

```bash
docker-compose up --build
```

## ✨ Features

✅ Device Management - Control IoT devices
✅ Sensor Monitoring - Real-time data
✅ Weather Widget - Weather display
✅ Admin Dashboard - Full control
✅ Responsive UI - Mobile & desktop
✅ Production Ready - Static export

## 💡 Key Points

- Frontend and Backend are **decoupled**
- Can be **deployed independently**
- **Static export** - no SSR needed
- **CORS enabled** for frontend requests
- **Dockerized** for easy deployment

## 🐛 Troubleshooting

**API not connecting?**
- Check backend is running: `curl http://localhost:5000/health`
- Check `.env.local` in frontend folder
- Check DevTools Console for errors

**Port already in use?**
```bash
# Kill process on port
# Windows: Get-NetTCPConnection -LocalPort 5000 | Stop-Process
# macOS/Linux: lsof -i :5000 | awk '{print $2}' | xargs kill
```

See `SETUP.md` for more troubleshooting.

## 📊 Technologies

- Next.js 16
- React 19
- Express.js
- Node.js 20+
- Tailwind CSS
- Docker
- AWS (Amplify, Lambda/EC2)

## 📞 Support

- See documentation files above
- Check `API_TESTING.md` for API details
- Check individual README files in `backend/` and `frontend/`

---

**Status**: ✅ Production Ready
**Last Updated**: December 4, 2025
