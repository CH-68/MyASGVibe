import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap, Target, Layers, Users, MessageSquare, X, ChevronDown,
  Send, RotateCcw, Phone, Mail, MapPin, ExternalLink, Star,
  TrendingUp, Award, Globe, Sparkles, Bot, ChevronRight
} from "lucide-react";

// ─── Particle Canvas ─────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const NUM = 80;
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; opacity: number };
    const particles: Particle[] = Array.from({ length: NUM }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x -= (dx / dist) * 0.8;
          p.y -= (dy / dist) * 0.8;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
        ctx.fill();
      });

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 102, 255, ${(1 - d / 130) * 0.35})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // mouse glow
      if (mx > 0) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 160);
        g.addColorStop(0, "rgba(0, 240, 255, 0.06)");
        g.addColorStop(1, "rgba(0, 240, 255, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function Typewriter({ text, speed = 22, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); onDone?.(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);
  return <span>{displayed}<span className="animate-pulse text-[#00F0FF]">▌</span></span>;
}

// ─── Counter ──────────────────────────────────────────────────────────────────
function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = () => {
          start += Math.ceil(to / 60);
          if (start >= to) { setVal(to); return; }
          setVal(start);
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GlassCard({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`relative rounded-xl border border-[rgba(0,240,255,0.15)] backdrop-blur-xl overflow-hidden cursor-pointer group ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(10,25,47,0.7) 0%, rgba(0,102,255,0.06) 100%)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(0,240,255,0.08)",
      }}
    >
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 1px rgba(0,240,255,0.35), 0 0 30px rgba(0,102,255,0.2)" }} />
      {children}
    </motion.div>
  );
}

// ─── Core Value Tile ──────────────────────────────────────────────────────────
const coreValues = [
  { icon: Zap, label: "Innovation", color: "#00F0FF", detail: "We pioneer AI-driven CX solutions, constantly pushing the boundary of what's possible in customer engagement technology." },
  { icon: Target, label: "Customer-Centric", color: "#0066FF", detail: "Every product decision starts with the customer. We obsess over experience quality, response times, and satisfaction metrics." },
  { icon: Layers, label: "Scalable", color: "#00F0FF", detail: "Built to grow with you — from SME to enterprise. Our platform scales horizontally with zero performance degradation." },
  { icon: Users, label: "Human Empowerment", color: "#0066FF", detail: "AI augments, never replaces. We believe technology should liberate teams to do their most meaningful work." },
];

function CoreValueTile({ value, idx }: { value: typeof coreValues[0]; idx: number }) {
  const [open, setOpen] = useState(false);
  const Icon = value.icon;
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="relative flex flex-col items-center gap-2 p-4 rounded-xl border border-[rgba(0,240,255,0.15)] backdrop-blur-xl text-center group transition-all duration-300"
        style={{ background: "rgba(10,25,47,0.5)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * idx }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{ background: `radial-gradient(circle, ${value.color}22 0%, transparent 70%)`, border: `1px solid ${value.color}44` }}>
          <Icon size={18} style={{ color: value.color }} />
        </div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#F8FAFC]/80 font-['Rajdhani']">{value.label}</span>
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1px ${value.color}55, 0 0 20px ${value.color}15` }} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-sm w-full rounded-2xl p-6 relative"
              style={{
                background: "linear-gradient(135deg, rgba(10,25,47,0.95) 0%, rgba(0,102,255,0.1) 100%)",
                border: `1px solid ${value.color}44`,
                boxShadow: `0 0 60px ${value.color}22, 0 20px 60px rgba(0,0,0,0.5)`,
              }}
            >
              <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-[#64748B] hover:text-[#F8FAFC] transition-colors">
                <X size={16} />
              </button>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: `radial-gradient(circle, ${value.color}33 0%, transparent 70%)`, border: `1px solid ${value.color}55` }}>
                <Icon size={22} style={{ color: value.color }} />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC] mb-2 font-['Rajdhani'] tracking-wider">{value.label}</h3>
              <p className="text-sm text-[#F8FAFC]/70 leading-relaxed font-['Exo_2']">{value.detail}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
type Message = { role: "user" | "assistant"; content: string; sources?: string[]; id: string };

const QUICK_PROMPTS = [
  "What is InnovaBot?",
  "Tell me about CX Transformer",
  "Where is EngagePro located?",
  "What are your key achievements?",
];

const MOCK_RESPONSES: Record<string, { content: string; sources: string[] }> = {
  "What is InnovaBot?": {
    content: "InnovaBot is EngagePro's flagship AI-powered virtual assistant, built on advanced RAG (Retrieval-Augmented Generation) architecture. It delivers context-aware, real-time responses across voice, chat, and email channels — reducing average handling time by 40% while maintaining a 97% CSAT score. InnovaBot integrates seamlessly with CRM platforms, knowledge bases, and live-agent escalation pathways.",
    sources: ["Company_Brochure.pdf — p.4: InnovaBot Product Overview", "Company_Brochure.pdf — p.7: Technical Architecture"],
  },
  "Tell me about CX Transformer": {
    content: "CX Transformer is EngagePro's enterprise-grade customer experience platform. It unifies omnichannel touchpoints — WhatsApp, web chat, email, voice — under a single intelligent orchestration layer. Powered by proprietary NLU models trained on 500M+ customer interactions, CX Transformer delivers personalised journeys at scale, with real-time sentiment analysis and predictive routing capabilities.",
    sources: ["Company_Brochure.pdf — p.9: CX Transformer Suite", "Company_Brochure.pdf — p.12: Enterprise Deployment Guide"],
  },
  "Where is EngagePro located?": {
    content: "EngagePro is headquartered in the Singapore IBP Area (International Business Park), a premier technology hub in the heart of Southeast Asia. This strategic location positions us at the crossroads of Asia-Pacific's fastest-growing digital economies, enabling us to serve enterprise clients across Singapore, Malaysia, Indonesia, Thailand, and beyond.",
    sources: ["Company_Brochure.pdf — p.2: Company Overview", "Company_Brochure.pdf — p.15: Contact & Locations"],
  },
  "What are your key achievements?": {
    content: "EngagePro has achieved remarkable milestones since inception: recognised as a Top 10 CX AI Startup by TechAsia 2024, 40% average reduction in customer handling time across deployments, 97% CSAT across all enterprise clients, 250+ successful enterprise deployments in APAC, and processing over 10 million customer interactions monthly with 99.99% uptime SLA.",
    sources: ["Company_Brochure.pdf — p.3: Milestones & Recognition", "Company_Brochure.pdf — p.6: Case Studies"],
  },
};

function getBotResponse(msg: string): { content: string; sources: string[] } {
  const match = Object.keys(MOCK_RESPONSES).find((k) =>
    msg.toLowerCase().includes(k.toLowerCase().split(" ")[1] ?? k.toLowerCase())
  );
  return match
    ? MOCK_RESPONSES[match]
    : {
        content: "Thank you for your question! I'm InnovaBot, EngagePro's AI assistant. Based on our company knowledge base, EngagePro specialises in AI-powered customer engagement solutions across APAC. For detailed information on specific topics, feel free to use the quick prompts above or ask me anything about our products, achievements, or team.",
        sources: ["Company_Brochure.pdf — p.1: General Information"],
      };
}

function SourceCitation({ sources }: { sources: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-['JetBrains_Mono'] text-[#00F0FF]/60 hover:text-[#00F0FF] transition-colors"
      >
        <ChevronDown size={10} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        {sources.length} source{sources.length > 1 ? "s" : ""}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-1">
              {sources.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] font-['JetBrains_Mono'] text-[#64748B] p-2 rounded-lg"
                  style={{ background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.08)" }}>
                  <ExternalLink size={8} className="mt-0.5 text-[#00F0FF]/40 shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Bot Avatar ───────────────────────────────────────────────────────────────
function BotAvatar({ thinking }: { thinking: boolean }) {
  return (
    <div className="relative w-9 h-9 shrink-0">
      <motion.div
        animate={{ scale: thinking ? [1, 1.12, 1] : [1, 1.05, 1], opacity: thinking ? [0.6, 1, 0.6] : [0.4, 0.7, 0.4] }}
        transition={{ duration: thinking ? 0.7 : 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,240,255,0.3) 0%, transparent 70%)" }}
      />
      <div className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(0,102,255,0.3) 0%, rgba(0,240,255,0.15) 100%)", border: "1px solid rgba(0,240,255,0.4)" }}>
        <Bot size={14} className="text-[#00F0FF]" />
      </div>
      {thinking && (
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00F0FF] flex items-center justify-center">
          <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-1 h-1 rounded-full bg-[#0A192F]" />
        </div>
      )}
    </div>
  );
}

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm InnovaBot — EngagePro's AI-powered assistant. Ask me anything about our products, achievements, or how we can transform your customer engagement.",
      sources: [],
      id: "init",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typingId, setTypingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || thinking) return;
    const uid = Date.now().toString();
    setMessages((m) => [...m, { role: "user", content: text, id: uid }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const resp = getBotResponse(text);
      const aid = (Date.now() + 1).toString();
      setThinking(false);
      setTypingId(aid);
      setMessages((m) => [...m, { role: "assistant", content: resp.content, sources: resp.sources, id: aid }]);
    }, 1200 + Math.random() * 600);
  }, [thinking]);

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Session reset. How can I help you today?", sources: [], id: Date.now().toString() }]);
    setThinking(false);
    setTypingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_PROMPTS.map((p) => (
          <motion.button
            key={p}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => sendMessage(p)}
            disabled={thinking}
            className="text-[10px] font-['Rajdhani'] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full transition-all duration-200 disabled:opacity-40"
            style={{
              background: "rgba(0,102,255,0.1)",
              border: "1px solid rgba(0,102,255,0.3)",
              color: "#00F0FF",
            }}
          >
            {p}
          </motion.button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,240,255,0.2) transparent" }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {msg.role === "assistant" && <BotAvatar thinking={false} />}
              <div className={`max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-['Exo_2']"
                  style={msg.role === "user"
                    ? { background: "linear-gradient(135deg, rgba(0,102,255,0.35) 0%, rgba(0,102,255,0.2) 100%)", border: "1px solid rgba(0,102,255,0.4)", color: "#F8FAFC", borderRadius: "18px 18px 4px 18px" }
                    : { background: "rgba(10,25,47,0.7)", border: "1px solid rgba(0,240,255,0.12)", color: "#F8FAFC", borderRadius: "18px 18px 18px 4px" }
                  }
                >
                  {msg.role === "assistant" && msg.id === typingId
                    ? <Typewriter text={msg.content} onDone={() => setTypingId(null)} />
                    : msg.content}
                </div>
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && msg.id !== typingId && (
                  <SourceCitation sources={msg.sources} />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
            <BotAvatar thinking />
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(10,25,47,0.7)", border: "1px solid rgba(0,240,255,0.12)" }}>
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask InnovaBot anything..."
            disabled={thinking}
            className="w-full px-4 py-3 pr-10 rounded-xl text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none font-['Exo_2'] transition-all duration-200"
            style={{ background: "rgba(0,102,255,0.07)", border: "1px solid rgba(0,240,255,0.18)", caretColor: "#00F0FF" }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || thinking}
          className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all duration-200"
          style={{ background: "linear-gradient(135deg, #0066FF 0%, #00F0FF 100%)" }}
        >
          <Send size={14} className="text-white" />
        </motion.button>
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.4 }}
          onClick={clearChat}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#00F0FF] transition-colors duration-200"
          style={{ background: "rgba(100,116,139,0.1)", border: "1px solid rgba(100,116,139,0.2)" }}
          title="Clear chat"
        >
          <RotateCcw size={14} />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Quick Info Panel ─────────────────────────────────────────────────────────
function QuickInfoPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed right-4 bottom-20 z-50 w-72 rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(10,25,47,0.97) 0%, rgba(0,102,255,0.12) 100%)",
            border: "1px solid rgba(0,240,255,0.25)",
            boxShadow: "0 0 50px rgba(0,102,255,0.2), 0 20px 60px rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#00F0FF] font-['Rajdhani']">Quick Info</span>
            <button onClick={onClose} className="text-[#64748B] hover:text-[#F8FAFC] transition-colors"><X size={14} /></button>
          </div>
          <div className="space-y-3">
            <a href="tel:+6599663500" className="flex items-center gap-3 text-sm text-[#F8FAFC]/80 hover:text-[#00F0FF] transition-colors group font-['Exo_2']">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:border-[#00F0FF]/40 transition-colors"
                style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.15)" }}>
                <Phone size={11} className="text-[#00F0FF]" />
              </div>
              +65 9966 3500
            </a>
            <a href="mailto:info@engagepro2AI.com" className="flex items-center gap-3 text-sm text-[#F8FAFC]/80 hover:text-[#00F0FF] transition-colors group font-['Exo_2']">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:border-[#00F0FF]/40 transition-colors"
                style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.15)" }}>
                <Mail size={11} className="text-[#00F0FF]" />
              </div>
              info@engagepro2AI.com
            </a>
            <div className="flex items-center gap-3 text-sm text-[#F8FAFC]/80 font-['Exo_2']">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.15)" }}>
                <MapPin size={11} className="text-[#00F0FF]" />
              </div>
              Singapore IBP Area
            </div>
            <div className="flex items-center gap-3 text-sm text-[#F8FAFC]/80 font-['Exo_2']">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.15)" }}>
                <Globe size={11} className="text-[#00F0FF]" />
              </div>
              engagepro2AI.com
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [quickInfoOpen, setQuickInfoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"portal" | "chat">("portal");

  return (
    <div className="min-h-screen relative overflow-x-hidden font-['Exo_2']" style={{ background: "#0A192F" }}>
      <ParticleCanvas />

{/* Global ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #0066FF 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-8" style={{ background: "radial-gradient(circle, #00F0FF 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-28 pt-8">

        {/* ── Header Hero ────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0066FF, #00F0FF)", boxShadow: "0 0 20px rgba(0,240,255,0.4)" }}
            >
              <Sparkles size={14} className="text-white" />
            </motion.div>
            <span className="text-xs tracking-[0.4em] uppercase font-['Rajdhani'] font-semibold text-[#00F0FF]/70">AI-Powered CX Platform</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-['Rajdhani'] leading-none mb-4"
            style={{
              background: "linear-gradient(135deg, #F8FAFC 0%, #00F0FF 50%, #0066FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 200%",
              animation: "gradient-shift 4s ease infinite",
            }}
          >
            ENGAGEPRO
            <br />
            <span className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-widest" style={{ WebkitTextFillColor: "rgba(248,250,252,0.5)" }}>
              REVOLUTIONIZING CUSTOMER ENGAGEMENT
            </span>
          </h1>

          <div className="flex items-center justify-center gap-1.5">
            {["AI-Native", "Omnichannel", "APAC Leader", "Enterprise-Ready"].map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-[10px] tracking-widest uppercase font-['JetBrains_Mono'] px-2.5 py-1 rounded-full"
                style={{ background: "rgba(0,240,255,0.06)", border: "1px solid rgba(0,240,255,0.2)", color: "#00F0FF" }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.header>

        {/* ── Nav Tabs ───────────────────────────────────────────────────── */}
        <div className="flex justify-center mb-8">
          <div className="flex p-1 rounded-xl gap-1" style={{ background: "rgba(10,25,47,0.8)", border: "1px solid rgba(0,240,255,0.12)" }}>
            {([["portal", "Corporate Portal"], ["chat", "Chat with InnovaBot"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="px-5 py-2 rounded-lg text-xs font-bold tracking-widest uppercase font-['Rajdhani'] transition-all duration-250 relative"
                style={activeTab === id
                  ? { background: "linear-gradient(135deg, rgba(0,102,255,0.35) 0%, rgba(0,240,255,0.1) 100%)", color: "#00F0FF", border: "1px solid rgba(0,240,255,0.3)" }
                  : { color: "#64748B" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Portal Tab ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "portal" && (
            <motion.div key="portal" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>

              {/* Row 1: About + Vision + Mission */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <GlassCard className="md:col-span-1 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,102,255,0.2)", border: "1px solid rgba(0,102,255,0.4)" }}>
                      <Globe size={12} className="text-[#0066FF]" />
                    </div>
                    <span className="text-[10px] tracking-widest uppercase font-['Rajdhani'] font-bold text-[#0066FF]">About Us</span>
                  </div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
                    <p className="text-sm text-[#F8FAFC]/75 leading-relaxed font-['Exo_2']">
                      EngagePro is a Singapore-based AI company transforming customer experience across Asia-Pacific. We build intelligent, omnichannel engagement solutions that empower enterprises to deliver faster, smarter, and more human interactions at scale.
                    </p>
                  </motion.div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,240,255,0.15)", border: "1px solid rgba(0,240,255,0.35)" }}>
                      <Star size={12} className="text-[#00F0FF]" />
                    </div>
                    <span className="text-[10px] tracking-widest uppercase font-['Rajdhani'] font-bold text-[#00F0FF]">Vision</span>
                  </div>
                  <p className="text-sm text-[#F8FAFC]/75 leading-relaxed font-['Exo_2']">To be APAC's most trusted AI-native customer engagement platform — where every interaction feels effortlessly intelligent.</p>
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="mt-4 text-3xl">🌏</motion.div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,102,255,0.2)", border: "1px solid rgba(0,102,255,0.4)" }}>
                      <Target size={12} className="text-[#0066FF]" />
                    </div>
                    <span className="text-[10px] tracking-widest uppercase font-['Rajdhani'] font-bold text-[#0066FF]">Mission</span>
                  </div>
                  <p className="text-sm text-[#F8FAFC]/75 leading-relaxed font-['Exo_2']">Democratise enterprise-grade AI engagement technology — making it accessible, measurable, and transformative for every business.</p>
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2.5, repeat: Infinity }} className="mt-4 text-3xl">🎯</motion.div>
                </GlassCard>
              </div>

              {/* Row 2: Core Values + Achievements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,240,255,0.12)", border: "1px solid rgba(0,240,255,0.3)" }}>
                      <Zap size={12} className="text-[#00F0FF]" />
                    </div>
                    <span className="text-[10px] tracking-widest uppercase font-['Rajdhani'] font-bold text-[#00F0FF]">Core Values</span>
                    <span className="text-[9px] text-[#64748B] font-['JetBrains_Mono'] ml-auto">click to explore</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {coreValues.map((v, i) => <CoreValueTile key={v.label} value={v} idx={i} />)}
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,102,255,0.2)", border: "1px solid rgba(0,102,255,0.4)" }}>
                      <TrendingUp size={12} className="text-[#0066FF]" />
                    </div>
                    <span className="text-[10px] tracking-widest uppercase font-['Rajdhani'] font-bold text-[#0066FF]">Key Achievements</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { stat: 40, suffix: "%", label: "Reduction in handling time", color: "#00F0FF" },
                      { stat: 97, suffix: "%", label: "CSAT score across clients", color: "#0066FF" },
                      { stat: 250, suffix: "+", label: "Enterprise deployments", color: "#00F0FF" },
                      { stat: 10, suffix: "M+", label: "Monthly interactions", color: "#0066FF" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 * i }}
                        className="p-3 rounded-xl text-center"
                        style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${item.color}22` }}
                      >
                        <div className="text-2xl font-black font-['Rajdhani'] leading-none mb-1" style={{ color: item.color }}>
                          <AnimatedCounter to={item.stat} suffix={item.suffix} />
                        </div>
                        <div className="text-[10px] text-[#F8FAFC]/50 font-['JetBrains_Mono'] leading-tight">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.12)" }}>
                    <Award size={14} className="text-[#00F0FF] shrink-0" />
                    <span className="text-xs text-[#F8FAFC]/60 font-['Exo_2']"><span className="text-[#00F0FF] font-semibold">Top 10</span> CX AI Startup — TechAsia 2024</span>
                  </div>
                </GlassCard>
              </div>

              {/* Row 3: CTA Banner */}
              <GlassCard className="p-6 text-center">
                <p className="text-sm text-[#F8FAFC]/60 font-['Exo_2'] mb-3">Ready to transform your customer engagement?</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(0,102,255,0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab("chat")}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold font-['Rajdhani'] tracking-widest uppercase text-white"
                    style={{ background: "linear-gradient(135deg, #0066FF 0%, #00F0FF 100%)" }}
                  >
                    <MessageSquare size={14} />
                    Chat with InnovaBot
                    <ChevronRight size={14} />
                  </motion.button>
                  <a
                    href="mailto:info@engagepro2AI.com"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold font-['Rajdhani'] tracking-widest uppercase text-[#00F0FF] transition-all duration-200 hover:bg-[rgba(0,240,255,0.1)]"
                    style={{ border: "1px solid rgba(0,240,255,0.3)" }}
                  >
                    <Mail size={14} />
                    Get In Touch
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── Chat Tab ──────────────────────────────────────────────────── */}
          {activeTab === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <GlassCard className="p-6" style={{ minHeight: "520px" }}>
                {/* Chat header */}
                <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: "1px solid rgba(0,240,255,0.1)" }}>
                  <BotAvatar thinking={false} />
                  <div>
                    <h3 className="text-sm font-bold text-[#F8FAFC] font-['Rajdhani'] tracking-wider">INNOVABOT</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-[#64748B] font-['JetBrains_Mono']">Online · RAG-powered · v2.4</span>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="text-[10px] text-[#64748B] font-['JetBrains_Mono'] hidden sm:block">Company_Brochure.pdf</div>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.15)" }}>
                      <ExternalLink size={10} className="text-[#00F0FF]" />
                    </div>
                  </div>
                </div>
                <div style={{ height: "440px", display: "flex", flexDirection: "column" }}>
                  <ChatInterface />
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating Action Dock ──────────────────────────────────────────── */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.06, boxShadow: "0 0 30px rgba(0,240,255,0.4)" }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setQuickInfoOpen((o) => !o)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-['Rajdhani'] tracking-widest uppercase text-[#00F0FF] transition-all duration-200"
          style={{ background: "rgba(10,25,47,0.9)", border: "1px solid rgba(0,240,255,0.3)", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          <Phone size={12} />
          Quick Info
        </motion.button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(10,25,47,0.9)", border: "1px solid rgba(0,240,255,0.1)", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0066FF, #00F0FF)" }}>
            <Sparkles size={8} className="text-white" />
          </div>
          <span className="text-[10px] font-['JetBrains_Mono'] text-[#64748B]">EngagePro <span className="text-[#00F0FF]">·</span> Singapore IBP</span>
        </div>
      </div>

      <QuickInfoPanel open={quickInfoOpen} onClose={() => setQuickInfoOpen(false)} />

      {/* Keyframe animations */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        * { scrollbar-width: thin; scrollbar-color: rgba(0,240,255,0.15) transparent; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
}
