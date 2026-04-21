const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const nodemailer = require('nodemailer');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  maxHttpBufferSize: 50 * 1024 * 1024  // 50MB — required for image/video file transfer
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let users = []; // [{ id, username, publicKey }]  — in-memory only
require('dotenv').config();
// ── Nodemailer ───────────────────────────────────────────
// Set GMAIL_USER + GMAIL_PASS as environment variables.
// Use a Gmail App Password: https://support.google.com/accounts/answer/185833
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_PASS || ''
  }
});

async function sendJoinEmail(joinerUsername, existingUsername) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.log('[✉] Email skipped — set GMAIL_USER and GMAIL_PASS env vars to enable');
    return;
  }
  const hasExisting = !!existingUsername;
  const subject = hasExisting
    ? `🔔 ${joinerUsername} joined your SecureLink session`
    : `🔔 ${joinerUsername} is waiting in SecureLink`;

  const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
body{font-family:Arial,sans-serif;background:#07090f;color:#e8eaf2;margin:0;padding:0}
.wrap{max-width:520px;margin:40px auto;background:#0d1020;border-radius:16px;overflow:hidden;border:1px solid #1e2640}
.hdr{background:linear-gradient(135deg,#00e5cc18,#4f6ef718);padding:28px 32px 20px;border-bottom:1px solid #1e2640}
.logo{font-size:20px;font-weight:700;color:#00e5cc;letter-spacing:.08em}
.bdy{padding:28px 32px}
h2{margin:0 0 10px;font-size:18px;color:#e8eaf2}
p{color:#8892b0;line-height:1.7;margin:0 0 14px;font-size:14px}
.hi{color:#00e5cc;font-weight:600}
.badge{display:inline-block;background:rgba(0,229,204,.08);border:1px solid rgba(0,229,204,.2);border-radius:8px;padding:10px 18px;font-size:12px;color:#00e5cc;margin:10px 0;font-family:monospace}
.ftr{padding:14px 32px;border-top:1px solid #1e2640;font-size:11px;color:#4a5578}
</style></head><body>
<div class="wrap">
  <div class="hdr"><div class="logo">🔒 SecureLink</div></div>
  <div class="bdy">
    <h2>${hasExisting ? `${joinerUsername} joined your session` : 'Someone is waiting for you'}</h2>
    <p>${hasExisting
      ? `<span class="hi">${joinerUsername}</span> has joined. <span class="hi">${existingUsername}</span> was already in the room.`
      : `<span class="hi">${joinerUsername}</span> is in the SecureLink room waiting for you to join.`
    }</p>
    <div class="badge">🛡 AES-256-GCM · ECDH · DTLS-SRTP · No logs</div>
    <p style="margin-top:16px">Open the app to start your encrypted conversation.</p>
  </div>
  <div class="ftr">No message content is included in this email. SecureLink never stores messages.</div>
</div></body></html>`;

  try {
    await transporter.sendMail({
      from: `"SecureLink" <${process.env.GMAIL_USER}>`,
      to: 'vakitirahul@gmail.com',
      subject,
      html
    });
    console.log(`[✉] Email → vakitirahul@gmail.com | ${joinerUsername} joined`);
  } catch (err) {
    console.error('[✉] Email error:', err.message);
  }
}

// ── Socket.IO ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on('join', async ({ username }) => {
    if (users.length >= 2) { socket.emit('room-full'); return; }
    const existingUser = users[0]?.username || null;
    users.push({ id: socket.id, username, publicKey: null });

    socket.emit('joined', { userId: socket.id, username, peers: users.filter(u => u.id !== socket.id) });

    const other = users.find(u => u.id !== socket.id);
    if (other) io.to(other.id).emit('peer-joined', { username, id: socket.id });

    io.emit('user-count', users.length);
    console.log(`[+] Joined: ${username} | ${users.length}/2`);

    // Fire-and-forget email
    sendJoinEmail(username, existingUser);
  });

  socket.on('public-key', ({ publicKey }) => {
    const me    = users.find(u => u.id === socket.id);
    if (!me) return;
    me.publicKey = publicKey;
    const other = users.find(u => u.id !== socket.id);
    if (!other) return;
    io.to(other.id).emit('peer-public-key', { publicKey, from: socket.id });
    if (other.publicKey) socket.emit('peer-public-key', { publicKey: other.publicKey, from: other.id });
  });

  socket.on('chat-message', ({ encrypted, iv }) => {
    const me    = users.find(u => u.id === socket.id);
    const other = users.find(u => u.id !== socket.id);
    if (me && other) io.to(other.id).emit('chat-message', { encrypted, iv, from: me.username, fromId: socket.id, timestamp: Date.now() });
  });

  socket.on('file-message', ({ fileData, iv, fileName, fileType, viewOnce }) => {
    const me    = users.find(u => u.id === socket.id);
    const other = users.find(u => u.id !== socket.id);
    if (me && other) io.to(other.id).emit('file-message', { fileData, iv, fileName, fileType, viewOnce, from: me.username, timestamp: Date.now() });
  });

  socket.on('typing', ({ isTyping }) => {
    const me    = users.find(u => u.id === socket.id);
    const other = users.find(u => u.id !== socket.id);
    if (me && other) io.to(other.id).emit('typing', { username: me.username, isTyping });
  });

  socket.on('call-request',  ({ callType }) => { const me = users.find(u=>u.id===socket.id); const o = users.find(u=>u.id!==socket.id); if(me&&o) io.to(o.id).emit('call-request',{callType,from:me.username}); });
  socket.on('call-accepted', ({ callType }) => { const o = users.find(u=>u.id!==socket.id); if(o) io.to(o.id).emit('call-accepted',{callType}); });
  socket.on('call-rejected', ()           => { const o = users.find(u=>u.id!==socket.id); if(o) io.to(o.id).emit('call-rejected'); });
  socket.on('call-ended',    ()           => { const o = users.find(u=>u.id!==socket.id); if(o) io.to(o.id).emit('call-ended'); });
  socket.on('webrtc-offer',  ({ offer, callType }) => { const o = users.find(u=>u.id!==socket.id); if(o) io.to(o.id).emit('webrtc-offer',{offer,callType}); });
  socket.on('webrtc-answer', ({ answer })           => { const o = users.find(u=>u.id!==socket.id); if(o) io.to(o.id).emit('webrtc-answer',{answer}); });
  socket.on('ice-candidate', ({ candidate })        => { const o = users.find(u=>u.id!==socket.id); if(o) io.to(o.id).emit('ice-candidate',{candidate}); });

  socket.on('disconnect', () => {
    const me = users.find(u => u.id === socket.id);
    users = users.filter(u => u.id !== socket.id);
    io.emit('user-count', users.length);
    if (users[0] && me) io.to(users[0].id).emit('peer-left', { username: me.username });
    console.log(`[-] ${me?.username || socket.id} | ${users.length}/2`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🔒 SecureLink → http://localhost:${PORT}\n`);
});