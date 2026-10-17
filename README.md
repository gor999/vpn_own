# BritShield VPN & Free Cinema Hub

A secure VPN client gateway and streaming hub to watch live BBC News broadcasts and stream free classic movies without geo-restrictions.

---

## 📋 Prerequisites

Before running the project on your computer, ensure you have **Node.js** installed:

- **Node.js**: Version **18.0.0** or higher (Version **20.x** or **22.x** recommended)
  - Download from: [https://nodejs.org](https://nodejs.org)
- **Terminal**: PowerShell / Command Prompt (Windows), Terminal (macOS), or Bash (Linux)

You can verify your installation by opening a terminal and running:
```bash
node -v
npm -v
```

---

## 🚀 Quick Start (Local Setup)

### 1. Open Terminal in the Project Folder
Unzip the downloaded project archive and navigate into the folder:

```bash
cd /path/to/britshield-vpn
```
*(On Windows, you can also open the folder in File Explorer, right-click inside the folder, and select **"Open in Terminal"** or **"Open PowerShell window here"**)*.

---

### 2. Install Dependencies
Run the following command to download and install all necessary packages:

```bash
npm install
```

---

### 3. Start the Development Server
Launch the application locally:

```bash
npm run dev
```

Once started, you will see output like:
```text
  VITE v8.x.x  ready in 250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

👉 **Open your browser and navigate to: `http://localhost:3000`**

---

## 🏗️ Production Build

To compile a production-ready, minified build:

```bash
npm run build
```

This generates an optimized static output in the `dist/` directory.

To test your production build locally:
```bash
npm run preview
```

---

## 🧪 Running Unit Tests

To run the built-in logic and security tests (runs via Node.js native test runner):

```bash
npm test
```

---

## 📂 Project Structure

```text
├── index.html              # HTML entry point
├── package.json            # Project dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build and server configuration
└── src/
    ├── App.tsx             # Main application layout and state manager
    ├── main.tsx            # React root mount
    ├── index.css           # Tailwind CSS imports and global styles
    ├── types/
    │   └── vpn.ts          # Type definitions (servers, movies, settings, news)
    ├── data/
    │   └── mockData.ts     # VPN server nodes, BBC stories, free movie library
    ├── utils/
    │   ├── vpnLogic.ts     # Pure logic (speed math, config generators, filters)
    │   └── vpnLogic.test.ts# Unit tests
    └── components/
        ├── Navbar.tsx          # Top bar with status pill & navigation tabs
        ├── DashboardView.tsx   # Central VPN power switch & live speed monitor
        ├── BBCNewsView.tsx     # BBC News live video/radio player & dispatches
        ├── FreeCinemaView.tsx  # Free classic movie theater & video player
        ├── ServerListView.tsx  # Worldwide server network selector
        ├── DiagnosticsView.tsx # Speedometer, leak audit & config exporter
        ├── SettingsModal.tsx   # Protocol switcher, kill switch & DNS guard
        └── QuickGuideModal.tsx # Onboarding guide modal
```

---

## ❓ Common Troubleshooting

1. **Port 3000 Already in Use**:
   If another application is using port 3000, start Vite on a different port:
   ```bash
   npx vite --port 3001
   ```

2. **Node Version Too Old**:
   If you see syntax errors during build, check your Node version (`node -v`). Update to Node.js 20 or 22 from [nodejs.org](https://nodejs.org).

3. **Missing Modules**:
   If you see `Error: Cannot find module`, delete the `node_modules` folder and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
