# CyberX Security Scanner Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- Python 3.7+ 
- Git

### For Linux (Recommended: Kali Linux)
```bash
sudo apt update
sudo apt install nodejs npm python3 python3-pip nmap
pip3 install scapy paramiko requests
```

### For Windows
1. Install Node.js from nodejs.org
2. Install Python from python.org
3. Install Nmap from nmap.org
```cmd
pip install scapy paramiko requests
```

## Installation Steps

### 1. Clone/Download Project
```bash
git clone <your-repo-url>
cd cyberx
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Install Electron (for desktop app)
```bash
npm install electron electron-builder --save-dev
```

### 5. Add Electron Scripts to package.json
Add these scripts to your main package.json:
```json
{
  "main": "electron/main.js",
  "scripts": {
    "electron": "electron .",
    "electron-dev": "NODE_ENV=development electron .",
    "build-electron": "npm run build && electron-builder",
    "dist": "electron-builder --publish=never"
  }
}
```

## Running the Application

### Development Mode (Web)
```bash
npm run dev
```
Open http://localhost:8080

### Desktop Application
```bash
# Development
npm run electron-dev

# Production
npm run build
npm run electron
```

### Backend Only
```bash
cd backend
npm start
```

## Building for Distribution

### Windows Executable
```bash
npm run build
npx electron-builder --win
```

### Linux AppImage/DEB
```bash
npm run build
npx electron-builder --linux
```

## Usage

1. **Registration**: Create account with router credentials
2. **Normal Mode**: Basic device scanning
3. **Admin Mode**: Enter router credentials for full LAN scan
4. **Scanning**: Use scan terminal for network discovery
5. **Reports**: Generate PDF/HTML security reports

## Troubleshooting

- **Python scripts fail**: Ensure Python 3 and pip packages installed
- **Nmap not found**: Install nmap system package
- **Permission denied**: Run with elevated privileges on Linux
- **Port conflicts**: Change backend port in server.js if needed

## Security Note
This tool is for authorized security testing only. Ensure you have permission to scan target networks.