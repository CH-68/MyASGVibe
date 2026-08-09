// Full static app UI in vanilla JavaScript
(function () {
  const root = document.getElementById('root');
  if (!root) return;

  // Basic layout with canvas for particles
  root.innerHTML = `
    <canvas id="particles" class="fixed inset-0 pointer-events-none z-0"></canvas>
    <div class="relative z-10" style="max-width:calc(100vw - 2in);margin:0 auto;padding-top:2rem;padding-bottom:7rem;">
      <header class="text-center mb-6" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;max-width:860px;margin:0 auto 32px;">
        <div style="display:flex;align-items:center;justify-content:center;gap:.5rem;margin-bottom:.5rem">
          <div id="spark" style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0066FF,#00F0FF);box-shadow:0 0 30px rgba(0,240,255,0.4);display:flex;align-items:center;justify-content:center;color:#fff">✨</div>
          <div style="font-size:12px;letter-spacing:.4em;color:#00F0FF;">AI-Powered CX Platform</div>
        </div>
        <h1 id="title" style="font-family:Rajdhani, sans-serif;font-weight:900;font-size:44px;line-height:1.05;text-align:center;max-width:780px;color:#e8f6ff;">ENGAGEPRO</h1>
        <p style="font-family:Inter, system-ui, sans-serif;font-size:20px;font-weight:300;max-width:720px;line-height:1.5;color:rgba(223,239,255,0.88);text-align:center;letter-spacing:.02em;">REVOLUTIONIZING CUSTOMER ENGAGEMENT</p>
        <div id="tags" style="margin-top:12px;display:flex;gap:6px;justify-content:center;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;"></div>
      </header>

      <div id="nav" style="display:flex;justify-content:center;margin-bottom:18px">
        <div style="display:flex;padding:6px;border-radius:12px;background:rgba(10,25,47,0.8);border:1px solid rgba(0,240,255,0.12)">
          <button data-tab="portal" class="tab active" style="padding:8px 14px;border-radius:8px;margin-right:6px">Corporate Portal</button>
          <button data-tab="chat" class="tab" style="padding:8px 14px;border-radius:8px">Chat with Innovabot</button>
        </div>
      </div>

      <main id="appContent"></main>

      <!-- Floating dock -->
      <div id="dock" style="position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;align-items:flex-end;gap:8px;z-index:40;backdrop-filter:blur(16px);">
        <button id="quickInfoBtn" class="btn" style="width:180px;padding:8px 12px;border-radius:12px;background:linear-gradient(135deg,#003b6b,#0066FF);border:1px solid rgba(0,102,255,0.24);color:#dff;font-weight:700;box-shadow:0 8px 18px rgba(0,102,255,0.12);opacity:.8;font-size:13px;">Get in Touch</button>
        <a id="dockChatLink" href="/innovabot#chat" class="btn" style="width:180px;padding:8px 12px;border-radius:12px;background:linear-gradient(135deg,#003b6b,#0066FF);border:1px solid rgba(0,102,255,0.24);color:#dff;font-weight:700;text-decoration:none;box-shadow:0 8px 18px rgba(0,102,255,0.12);opacity:.8;font-size:13px;">Chat with Innovabot</a>
      </div>

      <div id="quickInfoPanel" style="display:none;position:fixed;right:16px;bottom:90px;width:320px;border-radius:16px;z-index:50">
        <div class="glass card" style="padding:14px;position:relative;border-radius:16px;background:#000;border:1px solid rgba(255,255,255,0.06);color:#dfe;">
          <button id="closeQuickInfo" aria-label="Close quick info" style="position:absolute;top:8px;right:8px;background:none;border:none;color:#9aa;font-size:16px;cursor:pointer">✕</button>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <strong style="color:#00F0FF;font-size:12px">Quick Info</strong>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;color:#dfe;margin-top:6px">
            <a href="tel:+6599663500" style="color:inherit">📞 +65 9966 3500</a>
            <a href="mailto:info@engagepro2AI.com" style="color:inherit">✉️ info@engagepro2AI.com</a>
            <div>📍 Singapore IBP Area</div>
            <div>🌐 engagepro2AI.com</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // THEME TOGGLE: preserve earlier button if present
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', () => document.documentElement.classList.toggle('dark'));

  // Tags
  const tags = ['AI-Native', 'Omnichannel', 'APAC Leader', 'Enterprise-Ready'];
  const tagsEl = document.getElementById('tags');
  tags.forEach((t) => {
    const el = document.createElement('span');
    el.textContent = t;
    el.style.cssText = 'font-size:10px;letter-spacing:.12em;padding:6px;border-radius:999px;background:rgba(0,240,255,0.06);border:1px solid rgba(0,240,255,0.2);color:#00F0FF;';
    tagsEl.appendChild(el);
  });

  // --- Particle Canvas ---
  (function particleCanvas() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });
    const mouse = { x: -9999, y: -9999 };
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    const NUM = 80;
    const particles = Array.from({ length: NUM }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6, r: Math.random() * 2 + 1, o: Math.random() * 0.6 + 0.2 }));
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const mx = mouse.x, my = mouse.y;
      for (let p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = mx - p.x, dy = my - p.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) { p.x -= (dx / dist) * 0.8; p.y -= (dy / dist) * 0.8; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(0,240,255,${p.o})`; ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y; const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(0,102,255,${(1 - d / 130) * 0.28})`; ctx.lineWidth = 0.6; ctx.stroke(); }
      }
      if (mx > 0) { const g = ctx.createRadialGradient(mx, my, 0, mx, my, 160); g.addColorStop(0, 'rgba(0,240,255,0.06)'); g.addColorStop(1, 'rgba(0,240,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  // --- Simple Router / Tabs ---
  const content = document.getElementById('appContent');
  function setActiveTab(tab) {
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    render();
  }
  document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => setActiveTab(b.dataset.tab)));

  // --- Core data and helpers ---
  const coreValues = [
    { label: 'Innovation', color: '#00F0FF', icon: '⚡', detail: 'We pioneer AI-driven CX solutions, constantly pushing the boundary of what is possible.' },
    { label: 'Customer-Centric', color: '#0066FF', icon: '💬', detail: 'Every product decision starts with the customer. We obsess over experience quality.' },
    { label: 'Scalable', color: '#00F0FF', icon: '📈', detail: 'Built to grow with you — from SME to enterprise.' },
    { label: 'Human Empowerment', color: '#0066FF', icon: '🤝', detail: 'AI augments, never replaces. Technology should liberate teams.' },
  ];

  const QUICK_PROMPTS = [
    'What is InnovaBot?', 'Tell me about CX Transformer', 'Where is EngagePro located?', 'What are your key achievements?'
  ];

  const MOCK_RESPONSES = {
    'What is InnovaBot?': { content: 'InnovaBot is EngagePro\'s flagship AI-powered virtual assistant, built on advanced RAG architecture.', sources: ['Internal Knowledge Base — InnovaBot Product Overview'] },
    'Tell me about CX Transformer': { content: 'CX Transformer is EngagePro\'s enterprise-grade customer experience platform.', sources: ['Internal Knowledge Base — CX Transformer Suite'] },
    'Where is EngagePro located?': { content: 'EngagePro is headquartered in the Singapore IBP Area.', sources: ['Internal Knowledge Base — Company Overview'] },
    'What are your key achievements?': { content: 'Top 10 CX AI Startup, 40% reduction in handling time, 97% CSAT.', sources: ['Internal Knowledge Base — Milestones & Recognition'] },
  };

  function getBotResponse(msg) {
    const key = Object.keys(MOCK_RESPONSES).find(k => msg.toLowerCase().includes(k.split(' ')[1]?.toLowerCase() ?? k.toLowerCase()));
    return key ? MOCK_RESPONSES[key] : { content: "I'm InnovaBot. Ask me anything about products or achievements.", sources: ['Internal Knowledge Base — General Information'] };
  }

  // --- Render functions ---
  function renderPortal() {
    const el = document.createElement('div');
    // Row 1: About / Vision / Mission
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:12px">
        <div class="glass card"><strong>About Us</strong><p style="margin:8px 0;color:#dfe">EngagePro is a Singapore-based AI company transforming customer experience across Asia-Pacific.</p></div>
        <div class="glass card"><strong>Vision</strong><p style="margin:8px 0;color:#dfe">To be APAC's most trusted AI-native customer engagement platform.</p><div style="font-size:28px;margin-top:8px">🌏</div></div>
        <div class="glass card"><strong>Mission</strong><p style="margin:8px 0;color:#dfe">Democratise enterprise-grade AI engagement technology.</p><div style="font-size:28px;margin-top:8px">🎯</div></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <div class="glass card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><strong style="color:#00F0FF">Core Values</strong></div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">
            ${coreValues.map((v, i) => `<button data-core="${i}" class="core-tile" style="padding:16px 14px;border-radius:16px;border:1px solid rgba(0,240,255,0.14);background:rgba(10,25,47,0.45);text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:10px"><div style="width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;background:radial-gradient(circle,${v.color}22,transparent);color:${v.color}">${v.icon}</div><div style="font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#dfe">${v.label}</div></button>`).join('')}
          </div>
        </div>
        <div class="glass card">
          <strong style="color:#0066FF">Key Achievements</strong>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px">
            ${[{ stat: 40, suffix: '%', label: 'Reduction in handling time', color: '#00F0FF' }, { stat: 97, suffix: '%', label: 'CSAT score', color: '#0066FF' }, { stat: 250, suffix: '+', label: 'Enterprise deployments', color: '#00F0FF' }, { stat: 10, suffix: 'M+', label: 'Monthly interactions', color: '#0066FF' }].map(item => `<div class="stat" data-to="${item.stat}" style="padding:10px;border-radius:8px;background:rgba(0,0,0,0.2);border:1px solid ${item.color}22"><div style="font-size:20px;font-weight:800;color:${item.color}"><span data-val>0</span>${item.suffix}</div><div style="font-size:11px;color:#dfe;margin-top:6px">${item.label}</div></div>`).join('')}
          </div>
        </div>
      </div>

      <div class="glass card" style="text-align:center">
        <p style="color:#dfe;margin-bottom:8px">Ready to transform your customer engagement?</p>
      </div>
    `;


    return el;
  }

  // Modal for core values
  function openCoreModal(idx) {
    const v = coreValues[idx];
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.7);z-index:60';
    ov.innerHTML = `<div style="max-width:520px;background:linear-gradient(135deg,rgba(10,25,47,0.95),rgba(0,102,255,0.05));border:1px solid ${v.color}44;padding:20px;border-radius:16px;color:#dfe"><button id="closeModal" style="float:right;background:none;border:none;color:#9aa">✕</button><div style="display:flex;align-items:center;gap:12px"><div style="width:48px;height:48px;border-radius:50%;background:radial-gradient(circle,${v.color}33,transparent)"></div><div><h3 style="margin:0">${v.label}</h3><p style="margin:6px 0 0">${v.detail}</p></div></div></div>`;
    ov.addEventListener('click', () => ov.remove()); ov.querySelector('#closeModal').addEventListener('click', (e) => { e.stopPropagation(); ov.remove(); });
    document.body.appendChild(ov);
  }

  // --- Chat Implementation ---
  function renderChat() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="glass card" style="min-height:520px;display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(0,240,255,0.08);padding-bottom:12px;margin-bottom:12px">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,rgba(0,102,255,0.3),rgba(0,240,255,0.15));border:1px solid rgba(0,240,255,0.4);display:flex;align-items:center;justify-content:center;color:#00F0FF">🤖</div>
          <div><strong style="display:block">INNOVABOT</strong><small style="color:#9aa">Innovabot online · RAG-powered</small></div>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center"><button id="openDoc" style="background:none;border:none;color:#00F0FF">🔗</button></div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;height:440px">
          <div id="quickPrompts" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px"></div>
          <div id="messages" style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px;padding-right:6px"></div>
          <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
            <input id="chatInput" placeholder="Ask InnovaBot anything..." style="flex:1;padding:10px;border-radius:12px;background:rgba(0,102,255,0.07);border:1px solid rgba(0,240,255,0.18);color:#dfe" />
            <button id="sendBtn" class="btn primary">➡️</button>
            <button id="clearBtn" class="btn">⟲</button>
          </div>
        </div>
      </div>
    `;

    // populate quick prompts
    QUICK_PROMPTS.forEach(p => { const b = document.createElement('button'); b.textContent = p; b.className = 'btn'; b.style.cssText = 'font-size:11px;padding:6px;border-radius:999px;background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.3);color:#00F0FF'; b.addEventListener('click', () => sendMessage(p)); wrap.querySelector('#quickPrompts').appendChild(b); });

    // initial assistant message
    const messagesEl = wrap.querySelector('#messages');
    const initial = { role: 'assistant', content: "Hello! I'm InnovaBot — EngagePro's AI-powered assistant. Ask me anything." };
    appendMessage(initial);

    function appendMessage(msg, typing = false) {
      const m = document.createElement('div'); m.style.display = 'flex'; m.style.gap = '8px';
      if (msg.role === 'assistant') { m.innerHTML = `<div style="width:36px;height:36px">🤖</div><div style="max-width:82%"><div style="padding:10px;border-radius:16px;background:rgba(10,25,47,0.7);border:1px solid rgba(0,240,255,0.12);color:#dfe" data-content></div><div class="sources" style="margin-top:6px;display:none"></div></div>`; }
      else { m.innerHTML = `<div style="max-width:82%;margin-left:auto"><div style="padding:10px;border-radius:16px;background:linear-gradient(135deg, rgba(0,102,255,0.35), rgba(0,102,255,0.2));color:#fff;margin-left:auto">${escapeHtml(msg.content)}</div></div>`; }
      messagesEl.appendChild(m); messagesEl.scrollTop = messagesEl.scrollHeight;
      if (msg.role === 'assistant') {
        const contentEl = m.querySelector('[data-content]');
        if (typing) {
          contentEl.textContent = '';
          typewriter(contentEl, msg.content, 22).then(() => { if (msg.sources && msg.sources.length) { const sEl = m.querySelector('.sources'); sEl.innerHTML = `<button class="btn">${msg.sources.length} source${msg.sources.length > 1 ? 's' : ''}</button><div style="display:none;margin-top:6px;color:#9aa">${msg.sources.map(s => escapeHtml(s)).join('<br>')}</div>`; sEl.style.display = 'block'; sEl.querySelector('button').addEventListener('click', () => { const d = sEl.querySelector('div'); d.style.display = d.style.display === 'none' ? 'block' : 'none'; }); } });
        } else {
          contentEl.textContent = msg.content;
        }
      }
    }

    function sendMessage(text) {
      if (!text || !text.trim()) return;
      appendMessage({ role: 'user', content: text });
      const input = wrap.querySelector('#chatInput'); if (input) input.value = '';
      // thinking indicator
      const thinking = { role: 'assistant', content: '...' };
      appendMessage(thinking, false);
      setTimeout(() => {
        const resp = getBotResponse(text);
        // replace the last assistant placeholder
        const last = messagesEl.lastElementChild; if (last) last.remove();
        appendMessage({ role: 'assistant', content: resp.content, sources: resp.sources }, true);
      }, 1000 + Math.random() * 600);
    }

    // wire input and buttons
    wrap.querySelector('#sendBtn').addEventListener('click', () => sendMessage(wrap.querySelector('#chatInput').value));
    wrap.querySelector('#clearBtn').addEventListener('click', () => { messagesEl.innerHTML = ''; appendMessage({ role: 'assistant', content: 'Session reset. How can I help you today?' }) });
    wrap.querySelector('#chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(e.target.value); });

    return wrap;
  }

  function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // simple typewriter
  function typewriter(el, text, speed = 22) { return new Promise(res => { let i = 0; const iv = setInterval(() => { i++; el.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(iv); res(); } }, speed); }); }

  // animated counters via intersection observer
  function initCounters(container) { const els = container.querySelectorAll('[data-to]'); const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { const el = e.target; const to = parseInt(el.dataset.to, 10); const vEl = el.querySelector('[data-val]'); let cur = 0; const step = () => { cur += Math.ceil(to / 60); if (cur >= to) { vEl.textContent = to + (el.dataset.suffix || ''); return; } vEl.textContent = cur; requestAnimationFrame(step); }; requestAnimationFrame(step); obs.unobserve(el); } }); }, { threshold: 0.2 }); els.forEach(el => obs.observe(el)); }

  // render entry based on active tab
  function render() {
    const active = document.querySelector('.tab.active').dataset.tab;
    content.innerHTML = '';
    if (active === 'portal') {
      const portal = renderPortal(); content.appendChild(portal);
      // wire core value tiles
      portal.querySelectorAll('.core-tile').forEach(b => b.addEventListener('click', () => openCoreModal(b.dataset.core)));
      portal.querySelector('#toChat')?.addEventListener('click', () => setActiveTab('chat'));
      initCounters(portal);
    } else {
      const chat = renderChat(); content.appendChild(chat);
    }
  }

  // wire quick info panel
  document.getElementById('quickInfoBtn').addEventListener('click', () => { document.getElementById('quickInfoPanel').style.display = 'block'; });
  document.getElementById('closeQuickInfo').addEventListener('click', () => { document.getElementById('quickInfoPanel').style.display = 'none'; });

  // initialize
  render();

  // If page loaded with #chat, switch to chat tab
  if (location.hash === '#chat') {
    setActiveTab('chat');
  }

  // Make the dock chat link open the chat tab client-side and focus input
  const dockChat = document.getElementById('dockChatLink');
  if (dockChat) {
    dockChat.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveTab('chat');
      try { history.pushState(null, '', '/innovabot#chat'); } catch (err) { }
      // focus input after render
      setTimeout(() => {
        const inp = document.querySelector('#chatInput');
        if (inp) { inp.focus(); }
      }, 80);
    });
  }

})();
