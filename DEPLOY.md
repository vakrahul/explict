# 🚀 Deployment Guide — SecureLink

## Quick Summary
The app is a single Express server that serves the frontend from `/public`.  
No separate frontend deployment needed — just deploy the Node.js server.

---

## Option 1: Render (Recommended — Free Tier)

### Steps
1. Push your code to GitHub
2. Go to → https://render.com → **New → Web Service**
3. Connect your GitHub repo
4. Fill in:

| Field | Value |
|---|---|
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free |

5. Click **Deploy**
6. Render gives you a URL like `https://secure-chat-xyz.onrender.com`

> ✅ HTTPS is automatic — WebRTC will work.

---

## Option 2: Railway

1. Go to → https://railway.app → **New Project → Deploy from GitHub**
2. Select your repo
3. Railway auto-detects Node.js and runs `npm start`
4. Set env variable: `PORT = 3000` (optional, Railway sets it automatically)
5. Click **Generate Domain** in Settings → Networking

> ✅ HTTPS is automatic.

---

## Option 3: VPS / Ubuntu Server (Full Control)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone / upload your project
git clone https://github.com/yourusername/secure-chat.git
cd secure-chat
npm install

# 4. Install PM2 (process manager — keeps app running)
npm install -g pm2
pm2 start server.js --name secure-chat
pm2 startup    # auto-restart on reboot
pm2 save

# 5. Nginx reverse proxy (for HTTPS)
sudo apt install nginx certbot python3-certbot-nginx

# /etc/nginx/sites-available/secure-chat
server {
    server_name yourchat.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";   # Required for WebSockets!
        proxy_set_header Host $host;
    }
}

sudo certbot --nginx -d yourchat.yourdomain.com
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |

---

## ⚠️ Important: WebRTC + HTTPS

WebRTC (`getUserMedia`, `getDisplayMedia`) **requires HTTPS** in production.  
On localhost it works without HTTPS.

All three deployment options above provide HTTPS automatically.

---

## WebSocket / Socket.IO Note

Socket.IO uses WebSockets. Make sure your hosting platform supports **long-lived connections**.

- ✅ Render — supported
- ✅ Railway — supported  
- ✅ VPS with Nginx — supported (the `Upgrade` header in the config above handles this)
- ❌ Vercel / Netlify serverless — **NOT supported** (they kill connections after a few seconds)

---

## Testing Locally (2 tabs = 2 users)

```bash
npm install
npm start
# Open http://localhost:3000 in two browser tabs
# User 1 joins → User 2 joins → E2E encryption establishes → Chat!
```

---

## TURN Server (For Production Behind Strict NAT)

Google's free STUN servers work for most cases.  
If video calls fail on some networks (corporate firewalls, double NAT), add a TURN server:

```js
// server.js or pass via env variable
const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
};
```

Free TURN options: **Metered.ca** (free tier), **Twilio TURN** (pay-as-you-go), or self-host **coturn**.
