// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const API_BASE = "https://pro1943-slimgpt-api.hf.space";

// ─── ELEMENT REFS ───────────────────────────────────────────────────────────
const paramSidebar    = document.getElementById('paramSidebar');
const sidebarOverlay  = document.getElementById('sidebarOverlay');
const openSidebarBtn  = document.getElementById('openSidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');

const tempSlider   = document.getElementById('tempSlider');
const toppSlider   = document.getElementById('toppSlider');
const topkSlider   = document.getElementById('topkSlider');
const tokensSlider = document.getElementById('tokensSlider');
const repSlider    = document.getElementById('repSlider');
const tempVal      = document.getElementById('tempVal');
const toppVal      = document.getElementById('toppVal');
const topkVal      = document.getElementById('topkVal');
const tokensVal    = document.getElementById('tokensVal');
const repVal       = document.getElementById('repVal');

const statusPill  = document.getElementById('statusPill');
const statusDot   = document.getElementById('statusDot');
const statusLabel = document.getElementById('statusLabel');

const emptyState  = document.getElementById('emptyState');
const messageList = document.getElementById('messageList');
const chatInput   = document.getElementById('chatInput');
const sendBtn     = document.getElementById('sendBtn');
const clearChatBtn  = document.getElementById('clearChatBtn');
const exportChatBtn = document.getElementById('exportChatBtn');

// ─── STATE ──────────────────────────────────────────────────────────────────
let chatHistory  = [];
let isGenerating = false;

// ─── SIDEBAR TOGGLE ─────────────────────────────────────────────────────────
function openSidebar() {
  paramSidebar.classList.add('sidebar-open');
  sidebarOverlay.classList.add('active');
}
function closeSidebar() {
  paramSidebar.classList.remove('sidebar-open');
  sidebarOverlay.classList.remove('active');
}
openSidebarBtn.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
document.getElementById('mobileParamsBtn').addEventListener('click', openSidebar);

// ─── SLIDER SYNC ────────────────────────────────────────────────────────────
function syncSlider(slider, display) {
  display.textContent = slider.value;
  slider.addEventListener('input', e => display.textContent = e.target.value);
}
syncSlider(tempSlider, tempVal);
syncSlider(toppSlider, toppVal);
syncSlider(topkSlider, topkVal);
syncSlider(tokensSlider, tokensVal);
syncSlider(repSlider, repVal);

// ─── PARALLAX ORB EFFECT ────────────────────────────────────────────────────
document.addEventListener('mousemove', e => {
  const orbs = document.querySelectorAll('.ambient-orb');
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;
  orbs.forEach((orb, i) => {
    const f = (i + 1) * 22;
    orb.style.transform = `translate(${x * f}px, ${y * f}px) scale(${1 + x * 0.08})`;
  });
});

// ─── HEALTH MONITOR ─────────────────────────────────────────────────────────
async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'healthy') {
        setStatus('online');
        return;
      }
    }
    setStatus('offline');
  } catch {
    setStatus('offline');
  }
}

function setStatus(state) {
  if (state === 'online') {
    statusDot.className = 'w-2 h-2 rounded-full bg-tertiary status-online flex-shrink-0';
    statusLabel.textContent = 'API: ONLINE (CPU)';
    statusLabel.className = 'text-[10px] font-label-caps text-tertiary';
    statusPill.className = 'flex items-center gap-xs px-sm py-1 rounded-full bg-tertiary/10 border border-tertiary/20 transition-all duration-500';
  } else {
    statusDot.className = 'w-2 h-2 rounded-full bg-yellow-400 status-offline flex-shrink-0';
    statusLabel.textContent = 'API: WAKING UP';
    statusLabel.className = 'text-[10px] font-label-caps text-yellow-400';
    statusPill.className = 'flex items-center gap-xs px-sm py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 transition-all duration-500';
  }
}

// Poll every 10 seconds
checkHealth();
setInterval(checkHealth, 10000);

// ─── TEXTAREA AUTO-GROW ──────────────────────────────────────────────────────
chatInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// ─── ENTER KEY SEND ─────────────────────────────────────────────────────────
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
sendBtn.addEventListener('click', sendMessage);

// ─── PRESET CARDS ───────────────────────────────────────────────────────────
document.querySelectorAll('.preset-card').forEach(card => {
  card.addEventListener('click', () => {
    chatInput.value = card.dataset.prompt;
    chatInput.dispatchEvent(new Event('input'));
    chatInput.focus();
    sendMessage();
  });
});

// ─── CHAT UI HELPERS ────────────────────────────────────────────────────────
function showChatView() {
  emptyState.classList.add('hidden');
  messageList.classList.remove('hidden');
}

function scrollToBottom() {
  const container = document.getElementById('chatContent');
  container.scrollTop = container.scrollHeight;
}

function appendMessage(role, text) {
  showChatView();

  const wrapper = document.createElement('div');
  wrapper.className = `flex items-end gap-sm bubble-in ${role === 'user' ? 'flex-row-reverse self-end' : 'flex-row self-start'} max-w-[85%]`;

  // Avatar
  const avatar = document.createElement('div');
  avatar.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
    role === 'user'
      ? 'bg-white/10 border border-white/10'
      : 'bg-gradient-to-br from-primary/60 to-secondary-container'
  }`;
  avatar.innerHTML = role === 'user'
    ? '<span class="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>'
    : '<span class="material-symbols-outlined text-[16px] text-on-primary" style="font-variation-settings:\'FILL\' 1">neurology</span>';

  // Bubble
  const bubble = document.createElement('div');
  bubble.className = role === 'user'
    ? 'px-md py-sm rounded-xl rounded-br-sm text-on-surface text-[14px] leading-relaxed whitespace-pre-wrap break-words'
    : 'px-md py-sm rounded-xl rounded-bl-sm glass-panel border-l-2 border-primary/30 text-on-surface text-[14px] leading-relaxed whitespace-pre-wrap break-words';

  if (role === 'user') {
    bubble.style.cssText = 'background: rgba(109,59,215,0.35); border: 1px solid rgba(208,188,255,0.12); backdrop-filter:blur(8px);';
  }
  bubble.textContent = text;

  wrapper.appendChild(role === 'user' ? bubble : avatar);
  wrapper.appendChild(role === 'user' ? avatar : bubble);
  messageList.appendChild(wrapper);
  scrollToBottom();
  chatHistory.push({ role, text });
}

function showLoader() {
  showChatView();
  const loaderWrapper = document.createElement('div');
  loaderWrapper.id = 'loadingBubble';
  loaderWrapper.className = 'flex items-end gap-sm bubble-in max-w-[85%] self-start';

  // Avatar
  const avatar = document.createElement('div');
  avatar.className = 'w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-secondary-container flex items-center justify-center flex-shrink-0';
  avatar.innerHTML = '<span class="material-symbols-outlined text-[16px] text-on-primary" style="font-variation-settings:\'FILL\' 1">neurology</span>';

  const bubbleCol = document.createElement('div');
  bubbleCol.className = 'flex flex-col gap-xs';

  // Dots bubble
  const dotsBubble = document.createElement('div');
  dotsBubble.className = 'px-md py-sm rounded-xl rounded-bl-sm glass-panel border-l-2 border-primary/30 flex items-center gap-sm';
  dotsBubble.innerHTML = '<span class="dot-bounce flex gap-xs"><span></span><span></span><span></span></span>';

  // CPU warning badge
  const badge = document.createElement('div');
  badge.className = 'flex items-center gap-xs';
  badge.innerHTML = `
    <span class="material-symbols-outlined text-[12px] text-yellow-400">memory</span>
    <span class="text-[10px] font-label-code text-on-surface-variant opacity-70" style="font-family:'JetBrains Mono',monospace">CPU Inference active — responses take 15–30s</span>
  `;

  bubbleCol.appendChild(dotsBubble);
  bubbleCol.appendChild(badge);
  loaderWrapper.appendChild(avatar);
  loaderWrapper.appendChild(bubbleCol);
  messageList.appendChild(loaderWrapper);
  scrollToBottom();
}

function removeLoader() {
  const el = document.getElementById('loadingBubble');
  if (el) el.remove();
}

// ─── SEND MESSAGE ───────────────────────────────────────────────────────────
async function sendMessage() {
  const prompt = chatInput.value.trim();
  if (!prompt || isGenerating) return;

  // Clear input
  chatInput.value = '';
  chatInput.style.height = 'auto';

  isGenerating = true;
  sendBtn.disabled = true;

  appendMessage('user', prompt);
  showLoader();

  const payload = {
    prompt,
    model:             document.getElementById('modelSelect').value,
    max_new_tokens:    parseInt(tokensSlider.value),
    temperature:       parseFloat(tempSlider.value),
    top_k:             parseInt(topkSlider.value),
    top_p:             parseFloat(toppSlider.value),
    repetition_penalty: parseFloat(repSlider.value)
  };

  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    removeLoader();

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    appendMessage('assistant', data.response || 'No response received.');
    setStatus('online');
  } catch (err) {
    removeLoader();
    appendMessage('assistant', `⚠ Could not reach the SlimGPT API.\n${err.message}\n\nThe Space may be waking from sleep — try again in ~60 seconds.`);
    setStatus('offline');
  } finally {
    isGenerating = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

// ─── CLEAR CHAT ─────────────────────────────────────────────────────────────
clearChatBtn.addEventListener('click', () => {
  chatHistory = [];
  messageList.innerHTML = '';
  messageList.classList.add('hidden');
  emptyState.classList.remove('hidden');
});

// ─── EXPORT CHAT ────────────────────────────────────────────────────────────
exportChatBtn.addEventListener('click', () => {
  if (!chatHistory.length) { alert('No chat history to export.'); return; }
  const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `slimgpt-chat-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// ─── MODEL SELECTOR SYNC ────────────────────────────────────────────────────
document.getElementById('modelSelect').addEventListener('change', (e) => {
  const badge = document.getElementById('headerParamBadge');
  badge.textContent = e.target.value === 'v2' ? '~34M Parameters' : '~13M Parameters';
});
