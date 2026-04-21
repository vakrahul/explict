/**
 * SecureLink — Client App
 * Encryption: ECDH P-256 key exchange → HKDF → AES-256-GCM
 * Media: WebRTC DTLS-SRTP (encrypted natively)
 * Server: signaling only — never sees plaintext
 */

/* ── EMOJI DATA ──────────────────────────────────────────── */
const EMOJI_CATS = [
  { id: 'smileys',  icon: '😊', name: 'Smileys',  emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'] },
  { id: 'gestures', icon: '👋', name: 'Gestures', emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁','👅','👄','💋','🫦'] },
  { id: 'people',   icon: '👨', name: 'People',   emojis: ['👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋','🧏','🙇','🤦','🤷','👮','🕵️','💂','🥷','👷','🫅','🤴','👸','👰','🤵','🦸','🦹','🧙','🧚','🧛','🧜','🧝','🧞','🧟','🧌','💆','💇','🚶','🧍','🧎','🏃','💃','🕺','🕴','👯','🧖','🧗','🤺','🏇','⛷️','🏂','🏌️','🏄','🚣','🧘','🛀'] },
  { id: 'nature',   icon: '🌿', name: 'Nature',   emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🐢','🐍','🦎','🦕','🦖','🦑','🐙','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','��','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🌸','🌺','🌻','🌹','🌷','🍀','🌿','🍃','🍂','🍁','🌲','🌳','🌴','🌵','🌾','🌱','🌰','🍄','🐚','🪸','🪨','🌊','💧','🌙','⭐','🌈','☀️','🌤','⛅','🌧','⛈','❄️','🌪'] },
  { id: 'food',     icon: '🍕', name: 'Food',     emojis: ['🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍉','🍑','🍒','🍌','🍍','🥭','🍅','🥝','🍆','🥑','🫒','🥦','🥬','🥒','🌶','🫑','🌽','🥕','🫛','🧄','🧅','🥔','🍠','🫚','🥐','🥖','🍞','🥨','🥯','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🍲','🍜','🍝','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🧃','🥤','🧋','☕','🫖','🍵','🧉','🍺','🍻','🥂','🍷','🥃','🍸','🍹'] },
  { id: 'travel',   icon: '✈️', name: 'Travel',   emojis: ['🚗','🚕','🚙','🚌','🚎','🚐','🚑','🚒','🚓','🚔','🚖','🚘','🚍','🚜','🏎','🚚','🚛','🛻','🚃','🚋','🚞','🚝','🚄','🚅','🚈','🚂','🚆','🚇','🚊','🚉','✈️','🛫','🛬','🛩','💺','🛸','🚀','🛶','⛵','🚤','🛥','🛳','⛴','🚢','⚓','🗺','🧭','🏔','⛰','🌋','🗻','🏕','🏖','🏜','🏝','🏞','🏟','🏛','🏗','🧱','🏘','🏚','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🗼','🗽','⛪','🕌','🕍','⛩','🕋','⛲','⛺','🌁','🌃','🌄','🌅','🌆','🌇','🌉','🎠','🎡','🎢','🎪','🎭'] },
  { id: 'objects',  icon: '💡', name: 'Objects',  emojis: ['⌚','📱','💻','⌨️','🖥','🖨','🖱','🖲','💾','💿','📀','📷','📸','📹','🎥','📞','☎️','📟','📠','📺','📻','🧭','⏱','⏲','⏰','🕰','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯','🪔','🧯','🛢','💰','💵','💴','💶','💷','💸','💳','🪙','💹','📈','📉','📊','📋','📌','📍','📎','🖇','📏','📐','✂️','🗃','🗄','🗑','🔒','🔓','🔏','🔐','🔑','🗝','🔨','🪓','⛏','⚒','🛠','🗡','⚔️','🛡','🪚','🔧','🪛','🔩','⚙️','🗜','⚖️','🦯','🔗','⛓','🪝','🧲','🔬','🔭','📡','💉','🩸','💊','🩺','🩹','🩼','🩻','🪜','🧰','🧲','💣'] },
  { id: 'symbols',  icon: '❤️', name: 'Symbols',  emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💝','💘','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈹','🚰','🚹','🚺','🚼','🚻','🚽','🛁','🛚','🛄','🛅','🛃','🛂','🪪','🛂','🎵','🎶','🎼','🎤','🎧','🎷','🎸','🎹','🥁','🎺','🎻','🪘','🎙','🎚','🎛','📻','🎬','🎞','📽','🎥','📹','📷','📸','🎆','🎇','🧨','✨','🎉','🎊','🎈','🎋','🎍','🎎','🎏','🎐','🎑','🧧','🎀','🎁','🎗','🎟','🎫','🎖','🏆','🥇','🥈','🥉','🏅','🎪','🎭','🎨','🖼','🎰','🎲','♟','🧩','🪆','🧸','🪅'] },
];

/* ── STATE ──────────────────────────────────────────────── */
const state = {
  socket: null,
  username: '',
  userId: null,
  peerUsername: '',
  myKeyPair: null,
  sharedKey: null,
  peerConnection: null,
  localStream: null,
  callType: null,
  pendingIceCandidates: [],
  callTimer: null,
  callSeconds: 0,
  isMuted: false,
  isCameraOff: false,
  isSpeakerOff: false,
  typingTimeout: null,
  emojiOpen: false,
  currentEmojiCat: 0,
};

const STUN = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

/* ── DOM ────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const DOM = {
  landingScreen:  $('landing-screen'),
  loginScreen:    $('login-screen'),
  chatScreen:     $('chat-screen'),
  usernameInput:  $('username-input'),
  joinBtn:        $('join-btn'),
  roomFullMsg:    $('room-full-msg'),
  btnText:        document.querySelector('.btn-text'),
  btnLoader:      document.querySelector('.btn-loader'),

  messages:       $('messages'),
  messageInput:   $('message-input'),
  sendBtn:        $('send-btn'),
  typingArea:     $('typing-area'),
  typingName:     $('typing-name'),

  // Sidebar (desktop)
  peerAvatar:     $('peer-avatar'),
  peerName:       $('peer-name'),
  sidebarStatusDot: $('sidebar-status-dot'),
  statusText:     $('status-text'),
  myAvatar:       $('my-avatar'),
  myName:         $('my-name'),
  keyIndicator:   $('key-indicator'),
  roomCount:      $('room-count'),
  voiceCallBtn:   $('voice-call-btn'),
  videoCallBtn:   $('video-call-btn'),
  screenShareBtn: $('screen-share-btn'),

  // Mobile topbar
  mobilePeerAvatar: $('mobile-peer-avatar'),
  mobilePeerName:   $('mobile-peer-name'),
  mobileStatusDot:  $('mobile-status-dot'),
  mobileStatusText: $('mobile-status-text'),
  mVoiceBtn:        $('m-voice-btn'),
  mVideoBtn:        $('m-video-btn'),

  // Call overlay
  callOverlay:    $('call-overlay'),
  localVideo:     $('local-video'),
  remoteVideo:    $('remote-video'),
  localPip:       $('local-pip'),
  callPeerName:   $('call-peer-name'),
  callDuration:   $('call-duration'),
  callTypeBadge:  $('call-type-badge'),
  toggleMute:     $('toggle-mute'),
  toggleSpeaker:  $('toggle-speaker'),
  toggleCamera:   $('toggle-camera'),
  endCallBtn:     $('end-call-btn'),
  screenShareInd: $('screen-share-indicator'),

  callModal:      $('call-modal'),
  callFromName:   $('call-from-name'),
  callTypeText:   $('call-type-text'),
  acceptCallBtn:  $('accept-call-btn'),
  rejectCallBtn:  $('reject-call-btn'),

  toastContainer: $('toast-container'),
  floatBtn:       $('open-securelink-btn'),
  searchToggle:   $('search-toggle-btn'),
  searchBox:      $('land-search-box'),
  searchInput:    $('land-search-input'),
  searchHint:     $('search-hint'),
  emojiBtn:       $('emoji-btn'),
  emojiPicker:    $('emoji-picker'),
  emojiGrid:      $('emoji-grid'),
  emojiCats:      $('emoji-cats'),
  attachBtn:      $('attach-btn'),
  fileInput:      $('file-input'),
};

/* ── BASE64 HELPERS (chunked — safe for large files) ────── */
function uint8ToBase64(bytes) {
  // Process in 8KB chunks to avoid call-stack overflow on large buffers
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToUint8(b64) {
  const binary = atob(b64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/* ── CRYPTO ─────────────────────────────────────────────── */
const Crypto = {
  async generateKeyPair() {
    return crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']);
  },
  async exportPublicKey(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    return uint8ToBase64(new Uint8Array(raw));
  },
  async importPublicKey(b64) {
    return crypto.subtle.importKey('raw', base64ToUint8(b64), { name: 'ECDH', namedCurve: 'P-256' }, true, []);
  },
  async deriveSharedKey(myPriv, peerPub) {
    const bits = await crypto.subtle.deriveBits({ name: 'ECDH', public: peerPub }, myPriv, 256);
    const hkdf = await crypto.subtle.importKey('raw', bits, { name: 'HKDF' }, false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: new TextEncoder().encode('SecureLink-HKDF-Salt-v1'), info: new TextEncoder().encode('SecureLink-Chat-v1') },
      hkdf,
      { name: 'AES-GCM', length: 256 },
      false, ['encrypt', 'decrypt']
    );
  },
  async encrypt(key, text) {
    const iv  = crypto.getRandomValues(new Uint8Array(12));
    const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
    return { encrypted: uint8ToBase64(new Uint8Array(enc)), iv: uint8ToBase64(iv) };
  },
  async decrypt(key, encrypted, iv) {
    const dec = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToUint8(iv) },
      key,
      base64ToUint8(encrypted)
    );
    return new TextDecoder().decode(dec);
  }
};

/* ── WEBRTC ─────────────────────────────────────────────── */
const WebRTC = {
  create() {
    const pc = new RTCPeerConnection(STUN);
    pc.onicecandidate = ({ candidate }) => { if (candidate) state.socket.emit('ice-candidate', { candidate }); };
    pc.ontrack = ({ streams }) => { if (streams[0]) DOM.remoteVideo.srcObject = streams[0]; };
    pc.onconnectionstatechange = () => { if (['disconnected','failed','closed'].includes(pc.connectionState)) UI.endCallUI(); };
    state.peerConnection = pc;
    return pc;
  },
  async addStream(stream) {
    stream.getTracks().forEach(t => state.peerConnection.addTrack(t, stream));
  },
  async createOffer() {
    const o = await state.peerConnection.createOffer();
    await state.peerConnection.setLocalDescription(o);
    return o;
  },
  async handleOffer(offer) {
    await state.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    await WebRTC.flushICE();
    const a = await state.peerConnection.createAnswer();
    await state.peerConnection.setLocalDescription(a);
    return a;
  },
  async handleAnswer(answer) {
    await state.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    await WebRTC.flushICE();
  },
  async addICE(candidate) {
    const pc = state.peerConnection;
    if (!pc || !pc.remoteDescription) { state.pendingIceCandidates.push(candidate); return; }
    try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { /* non-fatal */ }
  },
  async flushICE() {
    const pc = state.peerConnection;
    if (!pc) return;
    const q = state.pendingIceCandidates.splice(0);
    for (const c of q) { try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) { /* */ } }
  },
  cleanup() {
    state.peerConnection?.close();
    state.peerConnection = null;
    state.localStream?.getTracks().forEach(t => t.stop());
    state.localStream = null;
    state.pendingIceCandidates = [];
    DOM.localVideo.srcObject = null;
    DOM.remoteVideo.srcObject = null;
  }
};

/* ── UI ─────────────────────────────────────────────────── */
const UI = {
  showChat() {
    DOM.loginScreen.classList.remove('active');
    DOM.chatScreen.style.display = 'flex';
    setTimeout(() => { DOM.chatScreen.style.display = 'flex'; DOM.chatScreen.classList.add('active'); }, 10);
  },

  addMessage(text, type = 'system', from = '', timestamp = Date.now()) {
    if (type === 'system') {
      const d = document.createElement('div');
      d.className = 'system-msg';
      d.innerHTML = `<div class="system-msg-inner">${text}</div>`;
      DOM.messages.appendChild(d);
    } else {
      const row = document.createElement('div');
      row.className = `message-row ${type === 'mine' ? 'mine' : 'theirs'}`;
      const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      row.innerHTML = `
        <div class="message-bubble">${escapeHtml(text)}</div>
        <div class="message-meta">${type === 'mine' ? 'You' : escapeHtml(from)} · ${time}</div>`;
      DOM.messages.appendChild(row);
    }
    DOM.messages.scrollTop = DOM.messages.scrollHeight;
  },

  setPeerOnline(username) {
    state.peerUsername = username;
    const initial = username[0].toUpperCase();

    // Sidebar
    if (DOM.peerAvatar)  { DOM.peerAvatar.textContent = initial; DOM.peerAvatar.classList.add('online'); }
    if (DOM.peerName)      DOM.peerName.textContent = username;
    if (DOM.sidebarStatusDot) DOM.sidebarStatusDot.className = 'status-dot online';
    if (DOM.statusText)    DOM.statusText.textContent = 'Online';
    if (DOM.roomCount)     DOM.roomCount.textContent = '2/2 online';

    // Mobile topbar
    if (DOM.mobilePeerAvatar) { DOM.mobilePeerAvatar.textContent = initial; DOM.mobilePeerAvatar.classList.add('online'); }
    if (DOM.mobilePeerName)    DOM.mobilePeerName.textContent = username;
    if (DOM.mobileStatusDot)   DOM.mobileStatusDot.className = 'status-dot online';
    if (DOM.mobileStatusText)  DOM.mobileStatusText.textContent = 'Online';

    // Enable inputs
    DOM.messageInput.disabled = false;
    DOM.sendBtn.disabled = false;
    DOM.emojiBtn.disabled = false;
    DOM.attachBtn.disabled = false;
    [DOM.voiceCallBtn, DOM.videoCallBtn, DOM.screenShareBtn, DOM.mVoiceBtn, DOM.mVideoBtn].forEach(b => { if (b) b.disabled = false; });
  },

  setPeerOffline() {
    if (DOM.peerAvatar)        DOM.peerAvatar.classList.remove('online');
    if (DOM.sidebarStatusDot)  DOM.sidebarStatusDot.className = 'status-dot offline';
    if (DOM.statusText)        DOM.statusText.textContent = 'Offline';
    if (DOM.roomCount)         DOM.roomCount.textContent = '1/2 online';
    if (DOM.mobilePeerAvatar)  DOM.mobilePeerAvatar.classList.remove('online');
    if (DOM.mobileStatusDot)   DOM.mobileStatusDot.className = 'status-dot offline';
    if (DOM.mobileStatusText)  DOM.mobileStatusText.textContent = 'Offline';

    DOM.messageInput.disabled = true;
    DOM.sendBtn.disabled = true;
    DOM.emojiBtn.disabled = true;
    DOM.attachBtn.disabled = true;
    [DOM.voiceCallBtn, DOM.videoCallBtn, DOM.screenShareBtn, DOM.mVoiceBtn, DOM.mVideoBtn].forEach(b => { if (b) b.disabled = true; });
    state.sharedKey = null;
    if (DOM.keyIndicator) { DOM.keyIndicator.textContent = 'Key pending...'; DOM.keyIndicator.classList.remove('established'); }
  },

  setKeyEstablished() {
    if (!DOM.keyIndicator) return;
    DOM.keyIndicator.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> AES-256 active`;
    DOM.keyIndicator.classList.add('established');
  },

  showCallOverlay(callType) {
    DOM.callPeerName.textContent = state.peerUsername;
    DOM.callTypeBadge.textContent = callType === 'screen' ? 'SCREEN' : callType === 'voice' ? 'VOICE' : 'VIDEO';
    DOM.callOverlay.classList.remove('hidden');
    // Full-screen API on mobile
    if (DOM.callOverlay.requestFullscreen) {
      DOM.callOverlay.requestFullscreen().catch(() => {});
    } else if (DOM.callOverlay.webkitRequestFullscreen) {
      DOM.callOverlay.webkitRequestFullscreen();
    }
    UI.startTimer();
  },

  endCallUI() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    DOM.callOverlay.classList.add('hidden');
    DOM.callModal.classList.add('hidden');
    UI.stopTimer();
    WebRTC.cleanup();
    DOM.localVideo.style.display = '';
    DOM.screenShareInd.classList.add('hidden');
    state.callType = null;
    state.isMuted = false;
    state.isCameraOff = false;
    state.isSpeakerOff = false;
    [DOM.toggleMute, DOM.toggleSpeaker, DOM.toggleCamera].forEach(b => b.classList.remove('active'));
  },

  showIncomingCall(from, callType) {
    DOM.callFromName.textContent = from;
    DOM.callTypeText.textContent = `Incoming ${callType} call`;
    DOM.callModal.classList.remove('hidden');
  },

  startTimer() {
    state.callSeconds = 0;
    state.callTimer = setInterval(() => {
      state.callSeconds++;
      const m = String(Math.floor(state.callSeconds / 60)).padStart(2, '0');
      const s = String(state.callSeconds % 60).padStart(2, '0');
      DOM.callDuration.textContent = `${m}:${s}`;
    }, 1000);
  },

  stopTimer() {
    clearInterval(state.callTimer);
    state.callTimer = null;
    DOM.callDuration.textContent = '00:00';
  },

  toast(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    DOM.toastContainer.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity .4s';
      setTimeout(() => el.remove(), 400);
    }, 3200);
  }
};

/* ── EMOJI PICKER ───────────────────────────────────────── */
function initEmojiPicker() {
  // Build category tabs
  EMOJI_CATS.forEach((cat, idx) => {
    const btn = document.createElement('button');
    btn.className = 'emoji-cat-btn' + (idx === 0 ? ' active' : '');
    btn.textContent = cat.icon;
    btn.title = cat.name;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentEmojiCat = idx;
      renderEmojiGrid(idx);
    });
    DOM.emojiCats.appendChild(btn);
  });
  renderEmojiGrid(0);
}

function renderEmojiGrid(catIdx) {
  DOM.emojiGrid.innerHTML = '';
  EMOJI_CATS[catIdx].emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-item';
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      const ta = DOM.messageInput;
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      ta.value = ta.value.substring(0, start) + emoji + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = start + emoji.length;
      ta.focus();
      ta.dispatchEvent(new Event('input'));
    });
    DOM.emojiGrid.appendChild(btn);
  });
}

function toggleEmojiPicker() {
  state.emojiOpen = !state.emojiOpen;
  DOM.emojiPicker.style.display = state.emojiOpen ? 'block' : 'none';
  DOM.emojiBtn.classList.toggle('active', state.emojiOpen);
}

/* ── CALL FUNCTIONS ─────────────────────────────────────── */
async function startCall(callType) {
  if (!state.sharedKey) { UI.toast('Encryption not established yet', 'error'); return; }
  state.callType = callType;
  try {
    state.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false
    });
    DOM.localVideo.srcObject = state.localStream;
    WebRTC.create();
    await WebRTC.addStream(state.localStream);
    state.socket.emit('call-request', { callType });
    UI.showCallOverlay(callType);
  } catch (err) {
    state.callType = null;
    UI.toast(`Media error: ${err.message}`, 'error');
  }
}

async function startScreenShare() {
  if (!state.sharedKey) return;
  state.callType = 'screen';
  try {
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: true });
    state.localStream = screen;
    // Do NOT set localVideo.srcObject — causes mirror glitch
    DOM.localVideo.style.display = 'none';
    DOM.screenShareInd.classList.remove('hidden');
    WebRTC.create();
    await WebRTC.addStream(screen);
    state.socket.emit('call-request', { callType: 'screen' });
    UI.showCallOverlay('screen');
    screen.getVideoTracks()[0].addEventListener('ended', () => { endCall(); UI.toast('Screen sharing stopped', 'info'); });
  } catch (err) {
    state.callType = null;
    if (err.name !== 'NotAllowedError') UI.toast(`Screen share error: ${err.message}`, 'error');
  }
}

async function acceptCall(callType) {
  DOM.callModal.classList.add('hidden');
  try {
    if (callType !== 'screen') {
      state.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false
      });
      DOM.localVideo.srcObject = state.localStream;
    }
    // Create PC NOW so ICE candidates aren't dropped
    WebRTC.create();
    if (state.localStream) await WebRTC.addStream(state.localStream);
    state.socket.emit('call-accepted', { callType });
    UI.showCallOverlay(callType);
  } catch (err) {
    UI.toast(`Cannot access media: ${err.message}`, 'error');
  }
}

function endCall() {
  state.socket.emit('call-ended');
  UI.endCallUI();
  UI.toast('Call ended', 'info');
}

/* ── SOCKET.IO ──────────────────────────────────────────── */
async function initSocket() {
  state.socket = io();

  state.socket.on('connect', () => state.socket.emit('join', { username: state.username }));

  state.socket.on('room-full', () => {
    DOM.roomFullMsg.classList.remove('hidden');
    DOM.btnText.classList.remove('hidden');
    DOM.btnLoader.classList.add('hidden');
    DOM.joinBtn.disabled = false;
  });

  state.socket.on('joined', async ({ userId, peers }) => {
    state.userId = userId;
    state.myKeyPair = await Crypto.generateKeyPair();
    const pub = await Crypto.exportPublicKey(state.myKeyPair.publicKey);
    state.socket.emit('public-key', { publicKey: pub });

    DOM.chatScreen.classList.add('active');
    DOM.chatScreen.style.display = 'flex';
    DOM.loginScreen.classList.remove('active');
    DOM.myAvatar.textContent = state.username[0].toUpperCase();
    DOM.myName.textContent   = state.username;

    if (peers.length > 0) {
      UI.setPeerOnline(peers[0].username);
      UI.addMessage('🔒 Joined. Establishing encrypted session...', 'system');
    } else {
      UI.addMessage('⏳ Waiting for peer. Share this URL with them.', 'system');
    }
  });

  state.socket.on('peer-joined', ({ username }) => {
    UI.setPeerOnline(username);
    UI.addMessage(`${username} joined the session`, 'system');
    UI.toast(`${username} connected`, 'success');
  });

  state.socket.on('peer-left', ({ username }) => {
    UI.setPeerOffline();
    UI.addMessage(`${username} left the session`, 'system');
    UI.toast(`${username} disconnected`, 'error');
    if (state.callType) UI.endCallUI();
    // Close emoji picker
    if (state.emojiOpen) toggleEmojiPicker();
  });

  state.socket.on('user-count', count => { if (DOM.roomCount) DOM.roomCount.textContent = `${count}/2 online`; });

  state.socket.on('peer-public-key', async ({ publicKey }) => {
    try {
      const peerPub   = await Crypto.importPublicKey(publicKey);
      state.sharedKey = await Crypto.deriveSharedKey(state.myKeyPair.privateKey, peerPub);
      UI.setKeyEstablished();
      UI.addMessage('🔐 End-to-end encryption established (AES-256-GCM)', 'system');
    } catch (err) {
      UI.toast('Key exchange failed', 'error');
    }
  });

  state.socket.on('chat-message', async ({ encrypted, iv, from, timestamp }) => {
    if (!state.sharedKey) return;
    try {
      const text = await Crypto.decrypt(state.sharedKey, encrypted, iv);
      UI.addMessage(text, 'theirs', from, timestamp);
    } catch {
      UI.addMessage('[Could not decrypt message]', 'system');
    }
  });

  state.socket.on('file-message', (payload) => handleIncomingFile(payload));

  state.socket.on('typing', ({ username, isTyping }) => {
    DOM.typingArea.style.display = isTyping ? 'block' : 'none';
    DOM.typingName.textContent = username;
  });

  state.socket.on('call-request', ({ callType, from }) => {
    state.callType = callType;
    UI.showIncomingCall(from, callType);
  });

  state.socket.on('call-accepted', async ({ callType }) => {
    if (!state.peerConnection) {
      WebRTC.create();
      if (state.localStream) await WebRTC.addStream(state.localStream);
    }
    const offer = await WebRTC.createOffer();
    state.socket.emit('webrtc-offer', { offer, callType });
  });

  state.socket.on('call-rejected', () => { UI.endCallUI(); UI.toast('Call declined', 'info'); });
  state.socket.on('call-ended',    () => { UI.endCallUI(); UI.toast('Call ended by peer', 'info'); });

  state.socket.on('webrtc-offer', async ({ offer }) => {
    try {
      if (!state.peerConnection) {
        WebRTC.create();
        if (state.localStream) await WebRTC.addStream(state.localStream);
      }
      const answer = await WebRTC.handleOffer(offer);
      state.socket.emit('webrtc-answer', { answer });
    } catch (err) {
      console.error('webrtc-offer error:', err);
      UI.toast('Call setup failed — retry', 'error');
    }
  });

  state.socket.on('webrtc-answer', async ({ answer }) => {
    try { await WebRTC.handleAnswer(answer); }
    catch (err) { console.error('webrtc-answer error:', err); UI.toast('Call setup failed — retry', 'error'); }
  });

  state.socket.on('ice-candidate', async ({ candidate }) => WebRTC.addICE(candidate));
}

/* ── EVENT LISTENERS ────────────────────────────────────── */

// Login form
DOM.usernameInput.addEventListener('input', () => {
  DOM.joinBtn.disabled = DOM.usernameInput.value.trim().length < 2;
});

DOM.usernameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !DOM.joinBtn.disabled) DOM.joinBtn.click();
});

DOM.joinBtn.addEventListener('click', () => {
  const username = DOM.usernameInput.value.trim();
  if (username.length < 2) return;
  state.username = username;
  DOM.btnText.classList.add('hidden');
  DOM.btnLoader.classList.remove('hidden');
  DOM.joinBtn.disabled = true;
  DOM.roomFullMsg.classList.add('hidden');
  initSocket();
});

// Send message
async function sendMessage() {
  const text = DOM.messageInput.value.trim();
  if (!text || !state.sharedKey) return;
  try {
    const { encrypted, iv } = await Crypto.encrypt(state.sharedKey, text);
    state.socket.emit('chat-message', { encrypted, iv });
    UI.addMessage(text, 'mine');
    DOM.messageInput.value = '';
    DOM.messageInput.style.height = 'auto';
    sendTyping(false);
  } catch { UI.toast('Encrypt failed', 'error'); }
}

DOM.sendBtn.addEventListener('click', sendMessage);

DOM.messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

DOM.messageInput.addEventListener('input', () => {
  DOM.messageInput.style.height = 'auto';
  DOM.messageInput.style.height = Math.min(DOM.messageInput.scrollHeight, 100) + 'px';
  sendTyping(true);
});

function sendTyping(isTyping) {
  if (state.socket) state.socket.emit('typing', { isTyping });
  if (isTyping) {
    clearTimeout(state.typingTimeout);
    state.typingTimeout = setTimeout(() => sendTyping(false), 2000);
  }
}

// Emoji button
DOM.emojiBtn.addEventListener('click', e => { e.stopPropagation(); toggleEmojiPicker(); });

// Close emoji picker when clicking outside
document.addEventListener('click', e => {
  if (state.emojiOpen && !DOM.emojiPicker.contains(e.target) && e.target !== DOM.emojiBtn) {
    toggleEmojiPicker();
  }
});

// Call buttons
DOM.videoCallBtn?.addEventListener('click', () => startCall('video'));
DOM.voiceCallBtn?.addEventListener('click', () => startCall('voice'));
DOM.screenShareBtn?.addEventListener('click', startScreenShare);
DOM.mVideoBtn?.addEventListener('click', () => startCall('video'));
DOM.mVoiceBtn?.addEventListener('click', () => startCall('voice'));
DOM.endCallBtn.addEventListener('click', endCall);

DOM.acceptCallBtn.addEventListener('click', () => acceptCall(state.callType));

DOM.rejectCallBtn.addEventListener('click', () => {
  DOM.callModal.classList.add('hidden');
  state.socket?.emit('call-rejected');
  state.callType = null;
});

// Toggle mute
DOM.toggleMute.addEventListener('click', () => {
  state.isMuted = !state.isMuted;
  state.localStream?.getAudioTracks().forEach(t => t.enabled = !state.isMuted);
  DOM.toggleMute.classList.toggle('active', state.isMuted);
  DOM.toggleMute.title = state.isMuted ? 'Unmute' : 'Mute mic';
});

// Toggle speaker (mute remote audio)
DOM.toggleSpeaker.addEventListener('click', () => {
  state.isSpeakerOff = !state.isSpeakerOff;
  DOM.remoteVideo.muted = state.isSpeakerOff;
  DOM.toggleSpeaker.classList.toggle('active', state.isSpeakerOff);
  DOM.toggleSpeaker.title = state.isSpeakerOff ? 'Unmute speaker' : 'Mute speaker';
  UI.toast(state.isSpeakerOff ? '🔇 Speaker muted' : '🔊 Speaker on', 'info');
});

// Toggle camera
DOM.toggleCamera.addEventListener('click', () => {
  state.isCameraOff = !state.isCameraOff;
  state.localStream?.getVideoTracks().forEach(t => t.enabled = !state.isCameraOff);
  DOM.toggleCamera.classList.toggle('active', state.isCameraOff);
  DOM.toggleCamera.title = state.isCameraOff ? 'Show camera' : 'Hide camera';
});

/* ── FILE TRANSFER ──────────────────────────────────────── */
DOM.attachBtn.addEventListener('click', () => DOM.fileInput.click());

DOM.fileInput.addEventListener('change', async () => {
  const file = DOM.fileInput.files[0];
  if (!file || !state.sharedKey) return;

  if (file.size > 20 * 1024 * 1024) {
    UI.toast('Max file size is 20MB', 'error');
    DOM.fileInput.value = '';
    return;
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  if (!isImage && !isVideo) {
    UI.toast('Only images and videos allowed', 'error');
    DOM.fileInput.value = '';
    return;
  }

  // Show sending placeholder
  const placeholderRow = document.createElement('div');
  placeholderRow.className = 'message-row mine';
  placeholderRow.innerHTML = `<div class="file-sending"><span class="typing-dots"><span></span><span></span><span></span></span> Encrypting & sending...</div>`;
  DOM.messages.appendChild(placeholderRow);
  DOM.messages.scrollTop = DOM.messages.scrollHeight;

  try {
    // Read as raw ArrayBuffer — encrypt BINARY not DataURL string
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes   = new Uint8Array(arrayBuffer);

    const iv  = crypto.getRandomValues(new Uint8Array(12));
    const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, state.sharedKey, fileBytes);

    const encB64 = uint8ToBase64(new Uint8Array(enc));
    const ivB64  = uint8ToBase64(iv);

    state.socket.emit('file-message', {
      fileData:  encB64,
      iv:        ivB64,
      fileName:  file.name,
      fileType:  file.type,
      viewOnce:  true
    });

    // Show preview for sender using local object URL (no re-encode needed)
    const objectUrl = URL.createObjectURL(file);
    placeholderRow.remove();
    addFileMessage(objectUrl, file.name, file.type, true, false);
    DOM.fileInput.value = '';

  } catch (err) {
    console.error('[File send error]', err);
    placeholderRow.remove();
    UI.toast(`Send failed: ${err.message || err}`, 'error');
  }
});

// Receive file from peer
function handleIncomingFile({ fileData, iv, fileName, fileType, viewOnce, from, timestamp }) {
  if (!state.sharedKey) return;

  crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToUint8(iv) },
    state.sharedKey,
    base64ToUint8(fileData)
  )
  .then(decrypted => {
    // Rebuild blob from raw bytes — no double-encode
    const blob      = new Blob([decrypted], { type: fileType });
    const objectUrl = URL.createObjectURL(blob);
    addFileMessage(objectUrl, fileName, fileType, false, viewOnce, from, timestamp);
  })
  .catch(err => {
    console.error('[File decrypt error]', err);
    UI.addMessage('[Could not decrypt file]', 'system');
  });
}

function addFileMessage(dataUrl, fileName, fileType, isMine, viewOnce = false, from = '', timestamp = Date.now()) {
  const row  = document.createElement('div');
  row.className = `message-row ${isMine ? 'mine' : 'theirs'}`;

  const time  = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const label = isMine ? 'You' : escapeHtml(from);
  const safeUrl  = dataUrl;
  const safeName = escapeHtml(fileName);

  let mediaHtml = '';

  if (viewOnce && !isMine) {
    // Receiver side — view-once tap to reveal
    const voId = 'vo' + Date.now() + Math.random().toString(36).slice(2, 6);
    mediaHtml = `
      <div class="view-once-wrapper" id="${voId}">
        <button class="view-once-btn" onclick="revealViewOnce('${voId}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          </svg>
          Tap to view once
        </button>
      </div>`;
    // Store data temporarily in a closure map
    window._voData = window._voData || {};
    window._voData[voId] = { dataUrl, fileType, fileName };
  } else if (fileType.startsWith('image/')) {
    mediaHtml = `
      <div class="file-media-wrap">
        <img src="${safeUrl}" class="file-img" alt="${safeName}" loading="lazy"/>
        <a href="${safeUrl}" download="${safeName}" class="file-download-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Download
        </a>
      </div>`;
  } else if (fileType.startsWith('video/')) {
    mediaHtml = `
      <div class="file-media-wrap">
        <video src="${safeUrl}" class="file-video" controls playsinline></video>
        <a href="${safeUrl}" download="${safeName}" class="file-download-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Download
        </a>
      </div>`;
  }

  row.innerHTML = `${mediaHtml}<div class="message-meta">${label} · ${time}${(viewOnce && !isMine) ? ' · 👁 view once' : ''}</div>`;
  DOM.messages.appendChild(row);
  DOM.messages.scrollTop = DOM.messages.scrollHeight;
}

// View-once reveal: shows media, auto-destroys after 15 seconds
window.revealViewOnce = function(voId) {
  const wrapper = document.getElementById(voId);
  if (!wrapper) return;
  const data = window._voData?.[voId];
  if (!data) return;

  const { dataUrl, fileType, fileName } = data;
  delete window._voData[voId];

  let content = '';
  const safeName = escapeHtml(fileName);

  if (fileType.startsWith('image/')) {
    content = `
      <img src="${dataUrl}" class="file-img" style="animation:msg-in .3s ease both"/>
      <a href="${dataUrl}" download="${safeName}" class="file-download-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Download
      </a>`;
  } else if (fileType.startsWith('video/')) {
    content = `
      <video src="${dataUrl}" class="file-video" controls autoplay playsinline style="animation:msg-in .3s ease both"></video>
      <a href="${dataUrl}" download="${safeName}" class="file-download-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Download
      </a>`;
  }

  wrapper.innerHTML = `<div class="file-media-wrap">${content}</div>`;

  // Auto-expire after 15 seconds — replaces content so data can't be recovered from DOM
  setTimeout(() => {
    wrapper.innerHTML = `<div class="view-once-expired">👁 View once — expired</div>`;
  }, 15000);
};

/* ── LANDING PAGE LOGIC ─────────────────────────────────── */

// Float button appears only on scroll
DOM.landingScreen.addEventListener('scroll', () => {
  const scrolled = DOM.landingScreen.scrollTop > 80;
  DOM.floatBtn.classList.toggle('visible', scrolled);
});

// Click floating button → "Better luck next time" (secret access via search)
DOM.floatBtn.addEventListener('click', () => {
  UI.toast('Better luck next time 😏', 'info');
});

// Search toggle
DOM.searchToggle.addEventListener('click', () => {
  DOM.searchBox.classList.toggle('open');
  if (DOM.searchBox.classList.contains('open')) {
    setTimeout(() => DOM.searchInput.focus(), 150);
  }
});

// Search input — type "0322" to open chat
const SECRET_CODE = '0322';
DOM.searchInput.addEventListener('input', () => {
  const val = DOM.searchInput.value;
  const remaining = SECRET_CODE.slice(val.length);

  if (val === SECRET_CODE) {
    DOM.searchHint.textContent = '';
    DOM.searchBox.classList.remove('open');
    DOM.searchInput.value = '';
    openChatLogin();
  } else if (SECRET_CODE.startsWith(val) && val.length > 0) {
    DOM.searchHint.textContent = `${val.length}/4`;
  } else if (val.length > 0) {
    DOM.searchHint.textContent = 'not found';
  } else {
    DOM.searchHint.textContent = '';
  }
});

DOM.searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    DOM.searchBox.classList.remove('open');
    DOM.searchInput.value = '';
    DOM.searchHint.textContent = '';
  }
});

function openChatLogin() {
  const landing = DOM.landingScreen;
  landing.style.opacity = '0';
  landing.style.transition = 'opacity .5s ease';
  setTimeout(() => {
    landing.classList.remove('active');
    landing.style.display = 'none';
    DOM.loginScreen.classList.add('active');
  }, 500);
}

// Mobile back button
$('mobile-back-btn')?.addEventListener('click', () => {
  // On mobile, just scroll messages to bottom or show sidebar (UX helper)
  DOM.messages.scrollTop = DOM.messages.scrollHeight;
});

/* ── UTILS ──────────────────────────────────────────────── */
function escapeHtml(str) {
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;')
    .replace(/\n/g,'<br>');
}

/* ── INIT ───────────────────────────────────────────────── */
initEmojiPicker();
console.log('%c🔒 SecureLink', 'font-size:18px;font-weight:bold;color:#00e5cc');