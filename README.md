# 🔒 SecureLink — Encrypted 1:1 Web Chat

A real-time, end-to-end encrypted chat and video call app. Only 2 users. No database. No logs. Encrypted in transit and at rest (client-side).

---

## Architecture

```
[User A Browser]  ←── Socket.IO ──→  [Node.js Server]  ←── Socket.IO ──→  [User B Browser]
       │                                     │                                      │
  ECDH keygen                     Signaling only                           ECDH keygen
  AES-256 encrypt                 (no plaintext)                           AES-256 decrypt
       │                                                                           │
       └─────────────── WebRTC P2P Audio/Video (DTLS-SRTP) ─────────────────────┘
```

### Encryption Flow
1. Both users generate **ECDH P-256 key pairs** locally
2. Public keys are exchanged via Socket.IO (server never sees private keys)
3. Each client derives a **shared AES-256-GCM key** using ECDH + HKDF (SHA-256)
4. All messages are **encrypted before sending** — server only relays ciphertext
5. Video/audio is **encrypted natively** via WebRTC's DTLS-SRTP

### Why Only 2 Users?
```js
// server.js
if (users.length >= 2) {
  socket.emit('room-full');
  return;  // connection rejected — no DB lookup needed
}
```

---

## Setup

```bash
git clone <repo>
cd secure-chat
npm install
npm start
```

App runs at: **http://localhost:3000**

Open in two different browser tabs/windows. Share the URL with your peer.

---

## Project Structure

```
secure-chat/
├── server.js          ← Express + Socket.IO signaling server
├── package.json
└── public/
    ├── index.html     ← Full single-page app
    ├── style.css      ← Cyber-noir dark UI (Oxanium + JetBrains Mono)
    └── app.js         ← Crypto, WebRTC, Socket.IO client logic
```

---

## Features

| Feature | Implementation |
|---|---|
| Text chat | Socket.IO + AES-256-GCM (Web Crypto API) |
| Key exchange | ECDH P-256 + HKDF via Socket.IO |
| Voice call | WebRTC `getUserMedia({ audio: true })` |
| Video call | WebRTC `getUserMedia({ video: true, audio: true })` |
| Screen share | WebRTC `getDisplayMedia()` |
| Mute/unmute | `audioTrack.enabled = false` |
| Camera on/off | `videoTrack.enabled = false` |
| Typing indicator | Socket.IO emit with 2s debounce |
| Room limit | In-memory array, reject on `length >= 2` |
| No persistence | All state in-memory, cleared on disconnect |

---

## Deployment

### Backend — Render / Railway

```bash
# Set environment variable
PORT=3000

# Start command
node server.js
```

### Frontend
The frontend is served by Express from the `/public` folder. No separate deployment needed.

> ⚠️ **HTTPS Required**: WebRTC (`getUserMedia`, `getDisplayMedia`) requires HTTPS in production. Render and Railway provide HTTPS automatically.

### Environment Variables
```env
PORT=3000   # optional, defaults to 3000
```

---

## Security Notes

- Server **never** receives or stores plaintext messages
- Server **never** stores encryption keys
- All messages are ephemeral — disappear on refresh
- WebRTC media streams are **DTLS-SRTP encrypted** (standard WebRTC security)
- Key derivation uses **HKDF with SHA-256** — resistant to brute-force
- Room max of **2** enforced server-side

---

## Dev Mode (auto-restart)

```bash
npm run dev   # uses nodemon
```
