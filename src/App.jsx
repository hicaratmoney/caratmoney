import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, TrendingDown, Shield, Sparkles, Info,
  Plus, Minus, Trash2, ChevronDown, ChevronUp, ArrowLeft, Zap,
  KeyRound, Search, ShieldCheck, X, Share2, Copy, AlertCircle, Check,
} from 'lucide-react';

// ─── Config ───────────────────────────────────────────────────────────────────
const SPOT_FALLBACK    = 15578;          // ₹/g — fallback if /api/rate is unreachable
const WHATSAPP_NUMBER  = '918618542353';
const STONE_RECOVERY   = 0.45;
const WASTAGE_RECOVERY = 0.80;
const MAX_ORNAMENTS    = 10;

// Buy rate (manually updated; will be wired to live source later — jab.org.in)
const BUY_RATE_24K  = 15901;             // ₹/g, GST-inclusive
const BUY_RATE_DATE = '27 Apr 2026';

// ─── Typography + background ──────────────────────────────────────────────────
const SERIF = "'Fraunces', Georgia, serif";
const SANS  = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const BG    = 'radial-gradient(1200px 600px at 50% -10%,#F8E9C4 0%,#FBF6EC 40%,#F6EFDE 100%)';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, d = 2) => {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '—';
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
};
const parseNum = v => {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
};
const makeId = () => `o_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const blankOrnament = () => ({ id: makeId(), gross: '', stone: '', wastage: '', purity: '', pricePerGram: '' });
const fmtTime = d => d ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null;

const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ─── Path-based routing (clean URLs, no hash) ────────────────────────────────
function useRoute() {
  const getPath = () => window.location.pathname || '/';
  const [route, setRoute] = useState(getPath);
  useEffect(() => {
    const h = () => setRoute(getPath());
    window.addEventListener('popstate', h);
    return () => window.removeEventListener('popstate', h);
  }, []);
  const navigate = useCallback(path => {
    window.history.pushState({}, '', path);
    setRoute(getPath());
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return { route, navigate };
}

// ─── SEO hook — updates title + meta description per route ────────────────────
const SEO_MAP = {
  '/': {
    title: 'Carat Money — Sell Gold at the Best Price in Bangalore',
    desc:  'Get the best price for your gold. Trusted by 5,000+ customers. Live rates, instant WhatsApp quotes, doorstep service across Bangalore.',
  },
  '/sell': {
    title: 'Sell Gold to Carat Money | Best Buying Rates in Bangalore',
    desc:  'Get an instant WhatsApp quote for your gold. We come to you. Trusted by 5,000+ sellers across India.',
  },
  '/buy': {
    title: 'Buy 24K Gold Coins | BIS-Hallmarked | Carat Money',
    desc:  'Buy BIS-hallmarked 24K gold coins online. 999.9 purity. 48-hour open-box delivery. WhatsApp to order.',
  },
  '/margin': {
    title: 'Gold Buyer Margin Calculator | Free Tool by Carat Money',
    desc:  "Free tool to check what your gold buyer is keeping above the spot rate. Used by 5,000+ sellers across India. Get a fair quote on WhatsApp.",
  },
};
function useSEO(route) {
  useEffect(() => {
    const seo = SEO_MAP[route] || SEO_MAP['/'];
    document.title = seo.title;
    const ensureMeta = (selector, attr, attrValue, contentValue) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentValue);
    };
    ensureMeta('meta[name="description"]', 'name', 'description', seo.desc);
    ensureMeta('meta[property="og:title"]', 'property', 'og:title', seo.title);
    ensureMeta('meta[property="og:description"]', 'property', 'og:description', seo.desc);
    ensureMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    ensureMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href);
  }, [route]);
}

// ─── Live spot rate hook ──────────────────────────────────────────────────────
function useSpotRate() {
  const [spot, setSpot] = useState({
    raw: null, display: null, updatedAt: null, loading: true, error: false,
  });
  const fetchRate = useCallback(async () => {
    try {
      const res  = await fetch('/api/rate');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const raw     = Math.round(data.sellPerGram);
      const display = Math.round(raw * 1.03 * 0.975);
      setSpot({ raw, display, updatedAt: new Date(), loading: false, error: false });
    } catch (err) {
      console.warn('[spot-rate]', err.message);
      setSpot(prev => ({ ...prev, loading: false, error: true }));
    }
  }, []);
  useEffect(() => {
    fetchRate();
    const id = setInterval(fetchRate, 60_000);
    return () => clearInterval(id);
  }, [fetchRate]);
  return spot;
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap');
  * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
  body { margin:0; background:#F6EFDE; }
  @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:.55} }
  @keyframes fadeSlide  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes stickyDrop { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes stickySwap { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp    { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
  input:focus { border-color:#B8860B!important; box-shadow:0 0 0 3px rgba(184,134,11,.12)!important; }
  button:active:not(:disabled) { transform:translateY(1px); }
  button.cm-add:hover        { background:#F6E9C6!important; border-color:#B8860B!important; }
  button.cm-icon:hover       { background:#F1F5F9!important; color:#475569!important; }
  button.cm-icon-danger:hover{ background:#FEE2E2!important; color:#B91C1C!important; }
  button.cm-card:hover       { transform:translateY(-2px)!important; box-shadow:0 16px 40px rgba(15,23,42,.18)!important; }
  button.cm-step:hover:not(:disabled) { background:#F6E9C6!important; }
  a.cm-link:hover            { color:#7C5A00!important; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  input[type=number] { -moz-appearance:textfield; }
`;

// ─── Rate Strip ───────────────────────────────────────────────────────────────
function RateStrip({ spot }) {
  const r24  = spot.display ?? SPOT_FALLBACK;
  const r22  = Math.round(r24 * 22 / 24);
  const time = fmtTime(spot.updatedAt);
  const statusText = spot.loading && !spot.updatedAt
    ? 'Fetching live rate…'
    : spot.error && !spot.updatedAt
      ? '⚠ Rate unavailable'
      : time ? time : '';
  return (
    <div style={{
      background: '#FAF2DC', borderBottom: '1px solid rgba(184,134,11,.15)',
      padding: '9px 16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: '6px 14px', fontFamily: SANS, fontSize: '12.5px',
    }}>
      <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontWeight:800, color:'#7C5A00', letterSpacing:'0.06em', fontSize:'10px' }}>
        <Zap size={10} strokeWidth={2.5} /> LIVE RATE
      </span>
      {[{ k:'24K', r:r24 }, { k:'22K', r:r22 }].map(({ k, r }) => (
        <span key={k} style={{ color:'#334155', fontWeight:600 }}>
          <span style={{ color:'#8B6508', marginRight:'3px' }}>{k}</span>₹{fmt(r, 0)}/g
        </span>
      ))}
      <span style={{ color: (spot.error && !spot.updatedAt) ? '#B91C1C' : '#94A3B8', fontSize:'11px', marginLeft:'auto', fontStyle:'italic' }}>
        {statusText}
      </span>
    </div>
  );
}

// ─── Back Button ──────────────────────────────────────────────────────────────
function BackBtn({ navigate }) {
  return (
    <button onClick={() => navigate('/')} style={{
      background:'none', border:'none', cursor:'pointer',
      display:'inline-flex', alignItems:'center', gap:'6px',
      color:'#8B6508', fontFamily:SANS, fontSize:'13px', fontWeight:700,
      padding:'16px 0 6px', letterSpacing:'0.02em',
    }}>
      <ArrowLeft size={15} strokeWidth={2.5} /> Home
    </button>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ navigate, spot }) {
  const [showGstTip, setShowGstTip] = useState(false);
  const r24  = spot.display ?? SPOT_FALLBACK;
  const r22  = Math.round(r24 * 22 / 24);
  const time = fmtTime(spot.updatedAt);

  return (
    <div style={{ minHeight:'100dvh', background:BG, fontFamily:SANS, color:'#0B1120' }}>
      <RateStrip spot={spot} />
      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 14px 40px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', padding:'32px 6px 26px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'#FFFFFF', color:'#7C5A00', fontSize:'10.5px', fontWeight:700, letterSpacing:'0.14em', padding:'6px 12px', borderRadius:'999px', marginBottom:'18px', boxShadow:'0 1px 2px rgba(15,23,42,.06),inset 0 0 0 1px rgba(184,134,11,.18)' }}>
            <Shield size={11} strokeWidth={2.8} /> CARAT MONEY
          </div>
          <h1 style={{ fontFamily:SERIF, fontSize:'36px', fontWeight:700, lineHeight:1.08, letterSpacing:'-0.02em', margin:'0 0 10px', color:'#0B1120' }}>
            Get the best price<br />for your <span style={{ color:'#8B6508', fontStyle:'italic' }}>gold</span>
          </h1>
          <p style={{ fontSize:'15px', color:'#475569', lineHeight:1.55, margin:0 }}>Trusted by 5,000+ customers across India.</p>
        </div>

        {/* Sell Rate Card */}
        <div style={{ background:'#FFFFFF', borderRadius:'20px', padding:'22px', boxShadow:'0 1px 2px rgba(15,23,42,.04),0 10px 30px rgba(15,23,42,.05)', marginBottom:'14px', border:'1px solid rgba(184,134,11,.08)' }}>
          <div style={{ fontSize:'10.5px', fontWeight:800, letterSpacing:'0.14em', color:'#94A3B8', marginBottom:'14px' }}>
            CARAT MONEY'S BUY RATE IN YOUR CITY
          </div>
          <div style={{ marginBottom:'4px' }}>
            {spot.loading && !spot.display
              ? <span style={{ fontFamily:SERIF, fontSize:'40px', fontWeight:700, color:'#D7C9A0' }}>Loading…</span>
              : <>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
                    <span style={{ fontFamily:SERIF, fontSize:'46px', fontWeight:700, lineHeight:1, letterSpacing:'-0.03em', color:'#0B1120' }}>₹{fmt(r24, 0)}</span>
                    <span style={{ fontFamily:SERIF, fontSize:'17px', color:'#64748B' }}>/g · 24K</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'6px', marginTop:'10px', paddingTop:'10px', borderTop:'1px dashed #EEF2F6' }}>
                    <span style={{ fontFamily:SERIF, fontSize:'20px', fontWeight:600, color:'#334155', letterSpacing:'-0.02em' }}>₹{fmt(r22, 0)}</span>
                    <span style={{ fontSize:'13px', color:'#94A3B8' }}>/g · 22K</span>
                    <span onClick={() => setShowGstTip(v => !v)} style={{ fontSize:'13px', color:'#B8860B', cursor:'pointer', userSelect:'none' }}>ⓘ</span>
                  </div>
                  {showGstTip && (
                    <div style={{ fontSize:'12px', color:'#64748B', background:'#FEF9EC', border:'1px solid rgba(184,134,11,.2)', borderRadius:'8px', padding:'8px 12px', marginTop:'8px', lineHeight:1.55 }}>
                      GST-inclusive rate shown. If you're GST-registered, we pass the tax credit back to you.
                    </div>
                  )}
                </>
            }
          </div>
          <div style={{ fontSize:'11.5px', color:'#94A3B8', marginTop:'12px', fontStyle:'italic', fontFamily:SERIF, lineHeight:1.5 }}>
            {spot.error && !spot.updatedAt
              ? 'Live rate temporarily unavailable'
              : time ? `Live rate · Updated ${time}` : 'Fetching live rate…'}
          </div>
        </div>

        {/* Sell Card — primary */}
        <button className="cm-card" onClick={() => navigate('/sell')} style={{
          width:'100%', background:'#0B1120', borderRadius:'20px', padding:'22px',
          border:'none', cursor:'pointer', textAlign:'left', marginBottom:'12px',
          boxShadow:'0 8px 24px rgba(15,23,42,.16)', transition:'transform .2s,box-shadow .2s',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'160px', height:'160px', borderRadius:'50%', background:'radial-gradient(circle,rgba(184,134,11,.3) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ fontSize:'10px', fontWeight:800, letterSpacing:'0.14em', color:'#8B6508', marginBottom:'8px' }}>SELL GOLD</div>
          <div style={{ fontFamily:SERIF, fontSize:'24px', fontWeight:700, color:'#FFFFFF', letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:'6px' }}>Sell to Carat Money</div>
          <div style={{ fontSize:'14px', color:'#94A3B8', lineHeight:1.5, marginBottom:'16px' }}>Get an instant WhatsApp quote. We come to you.</div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'#25D366', color:'#FFFFFF', padding:'9px 16px', borderRadius:'999px', fontSize:'13px', fontWeight:700, fontFamily:SANS }}>
            <MessageCircle size={14} /> Get a quote
          </div>
        </button>

        {/* Margin Card — secondary */}
        <button className="cm-card" onClick={() => navigate('/margin')} style={{
          width:'100%', background:'#FFFFFF', borderRadius:'20px', padding:'22px',
          border:'1px solid rgba(15,23,42,.06)', cursor:'pointer', textAlign:'left',
          marginBottom:'18px', boxShadow:'0 2px 8px rgba(15,23,42,.05)', transition:'transform .2s,box-shadow .2s',
        }}>
          <div style={{ fontSize:'10px', fontWeight:800, letterSpacing:'0.14em', color:'#94A3B8', marginBottom:'8px' }}>CHECK MARGIN</div>
          <div style={{ fontFamily:SERIF, fontSize:'24px', fontWeight:700, color:'#0B1120', letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:'6px' }}>Check your buyer's margin</div>
          <div style={{ fontSize:'14px', color:'#475569', lineHeight:1.5, marginBottom:'16px' }}>See exactly what your buyer is keeping above today's rate.</div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'#FAF2DC', color:'#8B6508', padding:'9px 16px', borderRadius:'999px', fontSize:'13px', fontWeight:700, fontFamily:SANS }}>
            <TrendingDown size={14} /> Calculate margin
          </div>
        </button>

        {/* Buy text link — tertiary */}
        <div style={{
          padding:'16px 18px', marginBottom:'18px',
          borderTop:'1px dashed rgba(184,134,11,.25)', borderBottom:'1px dashed rgba(184,134,11,.25)',
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px',
        }}>
          <span style={{ fontSize:'13.5px', color:'#475569' }}>Looking to buy gold?</span>
          <a className="cm-link" onClick={e => { e.preventDefault(); navigate('/buy'); }} href="/buy" style={{
            fontSize:'13.5px', fontWeight:700, color:'#8B6508', textDecoration:'none',
            display:'inline-flex', alignItems:'center', gap:'4px', cursor:'pointer',
            transition:'color .15s',
          }}>
            Buy 24K BIS-hallmarked coins →
          </a>
        </div>

        <div style={{ fontSize:'11.5px', color:'#8B7F6A', textAlign:'center', lineHeight:1.7, fontFamily:SERIF, fontStyle:'italic' }}>
          ₹100Cr+ gold purchased · 5,000+ customers · 4.9★
        </div>
      </div>
    </div>
  );
}

// ─── Sell Page ────────────────────────────────────────────────────────────────
function SellPage({ navigate, spot }) {
  const [name, setName]     = useState('');
  const [mobile, setMobile] = useState('');
  const [weight, setWeight] = useState('');
  const [city, setCity]     = useState('');

  const setMobileG  = v => setMobile(v.replace(/\D/g, '').slice(0, 10));
  const mobileValid = mobile.length === 10 && /^[6-9]/.test(mobile);
  const canSubmit   = mobileValid && name.trim().length >= 2 && parseNum(weight) > 0;

  const onSubmit = () => {
    if (!canSubmit) return;
    const lines = ["Hi Carat Money — I'd like to sell my gold.", '', `Name: ${name.trim()}`, `Phone: +91${mobile}`, `Approx. weight: ${weight}g`];
    if (city.trim()) lines.push(`City: ${city.trim()}`);
    lines.push('', 'Please send me a quote.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  const inp = { width:'100%', padding:'13px 14px', fontSize:'16px', border:'1.5px solid #E2E8F0', borderRadius:'12px', background:'#FFFFFF', color:'#0B1120', fontWeight:500, outline:'none', transition:'border-color .15s,box-shadow .15s', WebkitAppearance:'none', fontFamily:SANS };
  const lbl = { fontSize:'13.5px', fontWeight:600, color:'#1F2937', display:'block', marginBottom:'6px' };

  return (
    <div style={{ minHeight:'100dvh', background:BG, fontFamily:SANS, color:'#0B1120' }}>
      <RateStrip spot={spot} />
      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 14px 40px' }}>
        <BackBtn navigate={navigate} />
        <div style={{ textAlign:'center', padding:'10px 6px 20px' }}>
          <h1 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:700, lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 8px' }}>
            Sell your gold to <span style={{ color:'#8B6508', fontStyle:'italic' }}>Carat Money</span>
          </h1>
          <p style={{ fontSize:'14.5px', color:'#475569', lineHeight:1.55, margin:0 }}>Share your details and we'll reach out on WhatsApp.</p>
        </div>

        <div style={{ background:'#FFFFFF', borderRadius:'20px', padding:'22px', boxShadow:'0 1px 2px rgba(15,23,42,.04),0 10px 30px rgba(15,23,42,.05)', marginBottom:'14px', border:'1px solid rgba(15,23,42,.04)' }}>
          <div style={{ fontSize:'10.5px', fontWeight:800, letterSpacing:'0.14em', color:'#94A3B8', marginBottom:'20px' }}>YOUR DETAILS</div>

          <div style={{ marginBottom:'16px' }}>
            <label style={lbl}>Full name</label>
            <input type="text" placeholder="e.g. Priya S" value={name} onChange={e => setName(e.target.value)} style={inp} />
          </div>

          <div style={{ marginBottom:'16px' }}>
            <label style={lbl}>Mobile number</label>
            <div style={{ display:'flex', alignItems:'center', background:'#FFFFFF', borderRadius:'12px', border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
              <span style={{ padding:'13px 10px 13px 14px', fontSize:'16px', color:'#64748B', fontWeight:600, borderRight:'1px solid #E2E8F0', flexShrink:0 }}>+91</span>
              <input type="tel" inputMode="numeric" placeholder="10-digit number" value={mobile} onChange={e => setMobileG(e.target.value)} style={{ ...inp, border:'none', borderRadius:0, flex:1, minWidth:0 }} />
            </div>
          </div>

          <div style={{ marginBottom:'16px' }}>
            <label style={lbl}>Approx. gross weight</label>
            <div style={{ position:'relative' }}>
              <input type="number" inputMode="decimal" placeholder="e.g. 25" value={weight} onChange={e => setWeight(e.target.value)} style={{ ...inp, paddingRight:'54px' }} />
              <span style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', color:'#94A3B8', fontSize:'13px', fontWeight:600, pointerEvents:'none' }}>grams</span>
            </div>
          </div>

          <div>
            <label style={lbl}>City <span style={{ color:'#94A3B8', fontWeight:500, fontSize:'12.5px' }}>(optional)</span></label>
            <input type="text" placeholder="e.g. Bangalore" value={city} onChange={e => setCity(e.target.value)} style={inp} />
          </div>
        </div>

        <div style={{ background:'linear-gradient(150deg,#0B1120 0%,#1E293B 100%)', color:'#FFFFFF', borderRadius:'20px', padding:'24px 22px', marginBottom:'14px', boxShadow:'0 14px 40px rgba(15,23,42,.22)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle,rgba(184,134,11,.25) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:700, letterSpacing:'-0.02em', marginBottom:'16px', color:'#FFFFFF', position:'relative' }}>Get your WhatsApp quote</div>
          <button onClick={onSubmit} disabled={!canSubmit} style={{ width:'100%', padding:'15px', background:'#25D366', color:'#FFFFFF', border:'none', borderRadius:'12px', fontSize:'16px', fontWeight:700, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 6px 18px rgba(37,211,102,.38)', opacity:canSubmit?1:0.5, cursor:canSubmit?'pointer':'not-allowed', position:'relative', transition:'opacity .2s' }}>
            <MessageCircle size={18} /> Send details on WhatsApp
          </button>
          <div style={{ fontSize:'11.5px', color:'#94A3B8', marginTop:'12px', textAlign:'center', lineHeight:1.5, position:'relative' }}>By submitting, you agree to be contacted about your gold sale.</div>
        </div>

        <div style={{ fontSize:'11.5px', color:'#8B7F6A', textAlign:'center', lineHeight:1.7, fontFamily:SERIF, fontStyle:'italic' }}>We'll reach out within a few hours to schedule a visit.</div>
      </div>
    </div>
  );
}

// ─── Open Box Delivery Modal ──────────────────────────────────────────────────
function OpenBoxModal({ onClose }) {
  const Step = ({ icon, title, desc }) => (
    <div style={{ display:'flex', gap:'14px', alignItems:'flex-start', marginBottom:'20px' }}>
      <div style={{
        width:'48px', height:'48px', borderRadius:'12px',
        background:'linear-gradient(135deg,#FAF2DC 0%,#F6E9C6 100%)',
        border:'1px solid rgba(184,134,11,.18)',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        color:'#8B6508',
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily:SANS, fontSize:'15px', fontWeight:700, color:'#0B1120', marginBottom:'4px' }}>{title}</div>
        <div style={{ fontSize:'13.5px', color:'#475569', lineHeight:1.55 }}>{desc}</div>
      </div>
    </div>
  );
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(15,23,42,.55)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      animation:'fadeIn .25s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'#FFFFFF', borderRadius:'24px 24px 0 0',
        width:'100%', maxWidth:'520px', maxHeight:'92vh', overflowY:'auto',
        padding:'24px 22px 28px', animation:'slideUp .3s ease',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', gap:'12px' }}>
          <h2 style={{ fontFamily:SERIF, fontSize:'24px', fontWeight:700, margin:0, lineHeight:1.15, color:'#0B1120', letterSpacing:'-0.02em' }}>How Open Box Delivery Works</h2>
          <button onClick={onClose} aria-label="Close" style={{
            background:'#F1F5F9', border:'none', borderRadius:'50%',
            width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', color:'#475569', flexShrink:0,
          }}><X size={16} /></button>
        </div>
        <p style={{ fontSize:'14px', color:'#475569', lineHeight:1.55, marginTop:0, marginBottom:'24px' }}>
          We'll open the package at your doorstep so you can check the product before accepting it.
        </p>

        <Step icon={<KeyRound size={22} strokeWidth={2} />}    title="Share OTP to start"      desc="Give the start OTP to the delivery partner to start verification." />
        <Step icon={<Search size={22} strokeWidth={2} />}      title="Check the product"       desc="Make sure the product and packaging look right and in good condition." />
        <Step icon={<ShieldCheck size={22} strokeWidth={2} />} title="Confirm with final OTP"  desc="Share the final OTP only if everything's fine. If not, hand it back to the delivery partner." />

        <div style={{
          marginTop:'8px', padding:'14px 16px',
          background:'#FEF3C7', borderRadius:'12px',
          display:'flex', gap:'10px', alignItems:'flex-start',
        }}>
          <AlertCircle size={18} color="#B45309" style={{ flexShrink:0, marginTop:'2px' }} />
          <div style={{ fontSize:'13px', color:'#7C5A00', lineHeight:1.5, fontWeight:500 }}>
            Open box delivery orders are checked during delivery, so once they are accepted, they can't be returned.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Buy Page ────────────────────────────────────────────────────────────────
function BuyPage({ navigate, spot }) {
  const [qty, setQty]                     = useState({ '0.1': 0, '0.5': 0, '1': 0 });
  const [name, setName]                   = useState('');
  const [mobile, setMobile]               = useState('');
  const [pincode, setPincode]             = useState('');
  const [address, setAddress]             = useState('');
  const [showOpenBox, setShowOpenBox]     = useState(false);

  // Per-coin prices, rounded to whole rupees
  const prices = {
    '0.1': Math.round(BUY_RATE_24K * 0.1),
    '0.5': Math.round(BUY_RATE_24K * 0.5),
    '1':   Math.round(BUY_RATE_24K * 1.0),
  };

  const totalCoins  = qty['0.1'] + qty['0.5'] + qty['1'];
  const totalAmount = qty['0.1'] * prices['0.1'] + qty['0.5'] * prices['0.5'] + qty['1'] * prices['1'];

  const setQ = (size, delta) => setQty(prev => ({
    ...prev, [size]: Math.max(0, Math.min(99, prev[size] + delta)),
  }));

  const setMobileG  = v => setMobile(v.replace(/\D/g, '').slice(0, 10));
  const setPincodeG = v => setPincode(v.replace(/\D/g, '').slice(0, 6));
  const mobileValid  = mobile.length === 10 && /^[6-9]/.test(mobile);
  const pincodeValid = pincode.length === 6;
  const canSubmit    = mobileValid && pincodeValid && name.trim().length >= 2
                    && address.trim().length >= 8 && totalCoins > 0;

  const onSubmit = () => {
    if (!canSubmit) return;
    const lines = ['Hi Carat Money — I want to buy gold coins.', ''];
    if (qty['1']   > 0) lines.push(`${qty['1']} × 1g  coin  · ₹${fmt(qty['1']   * prices['1'],   0)}`);
    if (qty['0.5'] > 0) lines.push(`${qty['0.5']} × 0.5g coin · ₹${fmt(qty['0.5'] * prices['0.5'], 0)}`);
    if (qty['0.1'] > 0) lines.push(`${qty['0.1']} × 0.1g coin · ₹${fmt(qty['0.1'] * prices['0.1'], 0)}`);
    lines.push('', `Total: ₹${fmt(totalAmount, 0)} (${totalCoins} coins)`, '');
    lines.push(`Name: ${name.trim()}`);
    lines.push(`Phone: +91${mobile}`);
    lines.push(`Pincode: ${pincode}`);
    lines.push(`Address: ${address.trim()}`);
    lines.push('', 'Please confirm availability and delivery.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  };

  const inp = { width:'100%', padding:'13px 14px', fontSize:'16px', border:'1.5px solid #E2E8F0', borderRadius:'12px', background:'#FFFFFF', color:'#0B1120', fontWeight:500, outline:'none', transition:'border-color .15s,box-shadow .15s', WebkitAppearance:'none', fontFamily:SANS };
  const lbl = { fontSize:'13.5px', fontWeight:600, color:'#1F2937', display:'block', marginBottom:'6px' };

  // Stepper row for one coin size
  const StepperRow = ({ size, label }) => {
    const count = qty[size];
    const subtotal = count * prices[size];
    return (
      <div style={{
        display:'flex', alignItems:'center', gap:'12px',
        padding:'14px 0', borderTop: size === '0.1' ? '1px dashed #E2E8F0' : '1px dashed #E2E8F0',
      }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:'15px', fontWeight:700, color:'#0B1120', marginBottom:'2px' }}>{label}</div>
          <div style={{ fontSize:'12.5px', color:'#64748B' }}>₹{fmt(prices[size], 0)} each</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          <button className="cm-step" onClick={() => setQ(size, -1)} disabled={count === 0} style={{
            width:'34px', height:'34px', borderRadius:'10px',
            background:'#FAF2DC', border:'1.5px solid #D7C9A0', color:'#8B6508',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor: count === 0 ? 'not-allowed' : 'pointer',
            opacity: count === 0 ? 0.4 : 1, transition:'background .15s',
          }}><Minus size={16} strokeWidth={2.5} /></button>
          <span style={{
            fontFamily:SERIF, fontSize:'20px', fontWeight:700, color:'#0B1120',
            minWidth:'24px', textAlign:'center', letterSpacing:'-0.01em',
          }}>{count}</span>
          <button className="cm-step" onClick={() => setQ(size, +1)} style={{
            width:'34px', height:'34px', borderRadius:'10px',
            background:'#FAF2DC', border:'1.5px solid #D7C9A0', color:'#8B6508',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'background .15s',
          }}><Plus size={16} strokeWidth={2.5} /></button>
        </div>
        <div style={{
          fontFamily:SERIF, fontSize:'15px', fontWeight:700, color: subtotal > 0 ? '#0B1120' : '#CBD5E1',
          minWidth:'78px', textAlign:'right', letterSpacing:'-0.01em',
        }}>₹{fmt(subtotal, 0)}</div>
      </div>
    );
  };

  return (
    <div style={{ minHeight:'100dvh', background:BG, fontFamily:SANS, color:'#0B1120' }}>
      <RateStrip spot={spot} />
      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 14px 40px' }}>
        <BackBtn navigate={navigate} />

        <div style={{ textAlign:'center', padding:'10px 6px 20px' }}>
          <h1 style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:700, lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 8px' }}>
            Buy <span style={{ color:'#8B6508', fontStyle:'italic' }}>24K</span> gold coins
          </h1>
          <p style={{ fontSize:'14.5px', color:'#475569', lineHeight:1.55, margin:0 }}>
            BIS-hallmarked · 999.9 purity · 48-hour open-box return
          </p>
        </div>

        {/* Coin order picker */}
        <div style={{ background:'#FFFFFF', borderRadius:'20px', padding:'22px', boxShadow:'0 1px 2px rgba(15,23,42,.04),0 10px 30px rgba(15,23,42,.05)', marginBottom:'14px', border:'1px solid rgba(15,23,42,.04)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'8px' }}>
            <div style={{ fontSize:'10.5px', fontWeight:800, letterSpacing:'0.14em', color:'#94A3B8' }}>TODAY'S COIN PRICES</div>
            <div style={{ fontSize:'11px', color:'#94A3B8', fontStyle:'italic', fontFamily:SERIF }}>Updated {BUY_RATE_DATE}</div>
          </div>
          <div style={{ fontSize:'13px', color:'#475569', marginBottom:'4px' }}>
            Pick how many coins of each size you'd like.
          </div>

          <div>
            <StepperRow size="0.1" label="0.1g coin" />
            <StepperRow size="0.5" label="0.5g coin" />
            <StepperRow size="1"   label="1g coin" />
          </div>

          {/* Total + breakdown */}
          {totalCoins > 0 ? (
            <div style={{
              marginTop:'14px', padding:'16px',
              background:'#FAF7EF', border:'1px dashed #D7C9A0', borderRadius:'12px',
            }}>
              <div style={{ fontSize:'10px', fontWeight:800, letterSpacing:'0.14em', color:'#8B6508', marginBottom:'8px' }}>ORDER TOTAL</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'8px' }}>
                <span style={{ fontFamily:SERIF, fontSize:'30px', fontWeight:700, color:'#0B1120', letterSpacing:'-0.02em', lineHeight:1 }}>₹{fmt(totalAmount, 0)}</span>
                <span style={{ fontSize:'13px', color:'#64748B' }}>· {totalCoins} {totalCoins === 1 ? 'coin' : 'coins'}</span>
              </div>
              <div style={{ fontSize:'12.5px', color:'#475569', lineHeight:1.7 }}>
                {qty['1']   > 0 && <>{qty['1']} × 1g (₹{fmt(qty['1']   * prices['1'],   0)})</>}
                {qty['1']   > 0 && (qty['0.5'] > 0 || qty['0.1'] > 0) && ' + '}
                {qty['0.5'] > 0 && <>{qty['0.5']} × 0.5g (₹{fmt(qty['0.5'] * prices['0.5'], 0)})</>}
                {qty['0.5'] > 0 && qty['0.1'] > 0 && ' + '}
                {qty['0.1'] > 0 && <>{qty['0.1']} × 0.1g (₹{fmt(qty['0.1'] * prices['0.1'], 0)})</>}
              </div>
              <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'8px', fontStyle:'italic', fontFamily:SERIF }}>
                Prices include 3% GST.
              </div>
            </div>
          ) : (
            <div style={{
              marginTop:'14px', padding:'14px 16px',
              background:'#FEF9EC', borderRadius:'10px',
              fontSize:'12.5px', color:'#8B6508', textAlign:'center', lineHeight:1.55,
            }}>
              Tap + to add coins to your order.
            </div>
          )}

          {/* Custom coin note — inline */}
          <div style={{
            marginTop:'14px', padding:'14px 16px',
            background:'#F8FAFC', borderRadius:'10px',
            fontSize:'12.5px', color:'#475569', lineHeight:1.6, textAlign:'center',
          }}>
            Need a custom coin? <a className="cm-link" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Carat Money — I'm interested in a custom gold coin.")}`} target="_blank" rel="noreferrer" style={{ color:'#8B6508', fontWeight:700, textDecoration:'none' }}>WhatsApp us</a> to discuss specific weights or designs.
          </div>
        </div>

        {/* Details form */}
        <div style={{ background:'#FFFFFF', borderRadius:'20px', padding:'22px', boxShadow:'0 1px 2px rgba(15,23,42,.04),0 10px 30px rgba(15,23,42,.05)', marginBottom:'14px', border:'1px solid rgba(15,23,42,.04)' }}>
          <div style={{ fontSize:'10.5px', fontWeight:800, letterSpacing:'0.14em', color:'#94A3B8', marginBottom:'20px' }}>DELIVERY DETAILS</div>

          <div style={{ marginBottom:'16px' }}>
            <label style={lbl}>Full name</label>
            <input type="text" placeholder="e.g. Priya S" value={name} onChange={e => setName(e.target.value)} style={inp} />
          </div>

          <div style={{ marginBottom:'16px' }}>
            <label style={lbl}>Mobile number</label>
            <div style={{ display:'flex', alignItems:'center', background:'#FFFFFF', borderRadius:'12px', border:'1.5px solid #E2E8F0', overflow:'hidden' }}>
              <span style={{ padding:'13px 10px 13px 14px', fontSize:'16px', color:'#64748B', fontWeight:600, borderRight:'1px solid #E2E8F0', flexShrink:0 }}>+91</span>
              <input type="tel" inputMode="numeric" placeholder="10-digit number" value={mobile} onChange={e => setMobileG(e.target.value)} style={{ ...inp, border:'none', borderRadius:0, flex:1, minWidth:0 }} />
            </div>
          </div>

          <div style={{ marginBottom:'16px' }}>
            <label style={lbl}>Pincode</label>
            <input type="tel" inputMode="numeric" placeholder="6-digit pincode" value={pincode} onChange={e => setPincodeG(e.target.value)} style={inp} />
          </div>

          <div>
            <label style={lbl}>Delivery address</label>
            <textarea placeholder="House / Flat no, street, area, city" value={address} onChange={e => setAddress(e.target.value)}
              rows={3} style={{ ...inp, resize:'vertical', minHeight:'88px', fontFamily:SANS }} />
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div style={{ background:'linear-gradient(150deg,#0B1120 0%,#1E293B 100%)', color:'#FFFFFF', borderRadius:'20px', padding:'24px 22px', marginBottom:'14px', boxShadow:'0 14px 40px rgba(15,23,42,.22)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle,rgba(184,134,11,.25) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:700, letterSpacing:'-0.02em', marginBottom:'16px', color:'#FFFFFF', position:'relative' }}>Place your order on WhatsApp</div>
          <button onClick={onSubmit} disabled={!canSubmit} style={{ width:'100%', padding:'15px', background:'#25D366', color:'#FFFFFF', border:'none', borderRadius:'12px', fontSize:'16px', fontWeight:700, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 6px 18px rgba(37,211,102,.38)', opacity:canSubmit?1:0.5, cursor:canSubmit?'pointer':'not-allowed', position:'relative', transition:'opacity .2s' }}>
            <MessageCircle size={18} /> Send order on WhatsApp
          </button>
          <div style={{ fontSize:'11.5px', color:'#94A3B8', marginTop:'12px', textAlign:'center', lineHeight:1.5, position:'relative' }}>
            We'll confirm availability and arrange delivery.
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ background:'#FFFFFF', borderRadius:'20px', padding:'20px 22px', boxShadow:'0 1px 2px rgba(15,23,42,.04),0 10px 30px rgba(15,23,42,.05)', marginBottom:'14px', border:'1px solid rgba(15,23,42,.04)' }}>
          <div style={{ fontSize:'10.5px', fontWeight:800, letterSpacing:'0.14em', color:'#94A3B8', marginBottom:'14px' }}>WHY CARAT MONEY</div>
          {[
            { icon: <Shield size={16} strokeWidth={2.4} />, text: 'BIS-hallmarked, 999.9 purity', tip: false },
            { icon: <Check size={16} strokeWidth={2.4} />,  text: '48-hour open-box delivery',   tip: true  },
            { icon: <Check size={16} strokeWidth={2.4} />,  text: 'Assay certificate included',  tip: false },
          ].map((item, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'10px 0',
              borderTop: i === 0 ? 'none' : '1px dashed #EEF2F6',
            }}>
              <span style={{ color:'#15803D', flexShrink:0, display:'inline-flex' }}>{item.icon}</span>
              <span style={{ fontSize:'14px', color:'#0B1120', fontWeight:500, flex:1 }}>{item.text}</span>
              {item.tip && (
                <span onClick={() => setShowOpenBox(true)} style={{
                  fontSize:'13px', color:'#B8860B', cursor:'pointer', userSelect:'none',
                  padding:'2px 6px',
                }}>ⓘ</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ fontSize:'11.5px', color:'#8B7F6A', textAlign:'center', lineHeight:1.7, fontFamily:SERIF, fontStyle:'italic' }}>
          Coin prices include 3% GST. Free doorstep delivery within Bangalore.
        </div>
      </div>

      {showOpenBox && <OpenBoxModal onClose={() => setShowOpenBox(false)} />}
    </div>
  );
}

// ─── Share helpers (Margin page) ──────────────────────────────────────────────
function ShareSection({ inline }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/margin` : '';
  const text = `Found this free tool that shows you what gold buyers keep as margin above the spot rate. Saved me from a bad deal — try it before you sell:\n${url}`;

  const onWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  const onCopy = async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      background:'linear-gradient(135deg,#FAF2DC 0%,#F6E9C6 100%)',
      borderRadius:'20px', padding:'24px 22px',
      border:'1px solid rgba(184,134,11,.18)',
      marginBottom:'14px', textAlign:'center',
      animation: inline ? 'fadeSlide .5s ease-out' : 'none',
    }}>
      <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:700, color:'#0B1120', marginBottom:'6px', letterSpacing:'-0.02em' }}>
        Found this useful?
      </div>
      <div style={{ fontSize:'14px', color:'#475569', marginBottom:'18px', lineHeight:1.55 }}>
        Share with friends or family who might be selling gold soon.
      </div>
      <div style={{ display:'flex', gap:'10px' }}>
        <button onClick={onWhatsApp} style={{
          flex:1, padding:'13px', background:'#25D366', color:'#FFFFFF',
          border:'none', borderRadius:'12px', fontSize:'14.5px', fontWeight:700, fontFamily:SANS,
          display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px',
          cursor:'pointer', boxShadow:'0 4px 14px rgba(37,211,102,.32)', transition:'opacity .15s',
        }}>
          <MessageCircle size={16} /> WhatsApp
        </button>
        <button onClick={onCopy} style={{
          flex:1, padding:'13px', background:'#FFFFFF', color:'#0B1120',
          border:'1.5px solid #D7C9A0', borderRadius:'12px', fontSize:'14.5px', fontWeight:700, fontFamily:SANS,
          display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px',
          cursor:'pointer', transition:'background .15s',
        }}>
          {copied ? <><Check size={16} color="#15803D" /> Copied</> : <><Copy size={16} /> Copy link</>}
        </button>
      </div>
    </div>
  );
}

function FloatingShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/margin` : '';
  const text = `Found this free tool that shows you what gold buyers keep as margin above the spot rate. Saved me from a bad deal — try it before you sell:\n${url}`;

  const onWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setOpen(false);
  };
  const onCopy = async () => {
    const ok = await copyToClipboard(url);
    if (ok) { setCopied(true); setTimeout(() => { setCopied(false); setOpen(false); }, 1500); }
  };

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position:'fixed', inset:0, zIndex:90, background:'rgba(15,23,42,.3)', animation:'fadeIn .2s ease',
        }} />
      )}
      <div style={{
        position:'fixed', bottom:'20px', left:'20px', zIndex:100,
        display:'flex', flexDirection:'column-reverse', gap:'10px', alignItems:'flex-start',
      }}>
        <button onClick={() => setOpen(v => !v)} style={{
          background:'#0B1120', color:'#FFFFFF',
          padding:'12px 18px', borderRadius:'999px',
          border:'none', cursor:'pointer',
          display:'inline-flex', alignItems:'center', gap:'8px',
          fontFamily:SANS, fontSize:'13.5px', fontWeight:700,
          boxShadow:'0 8px 24px rgba(15,23,42,.32)',
          animation:'fadeSlide .4s ease-out',
        }}>
          <Share2 size={15} strokeWidth={2.5} /> Share tool
        </button>
        {open && (
          <>
            <button onClick={onWhatsApp} style={{
              background:'#25D366', color:'#FFFFFF',
              padding:'11px 16px', borderRadius:'999px',
              border:'none', cursor:'pointer',
              display:'inline-flex', alignItems:'center', gap:'7px',
              fontFamily:SANS, fontSize:'13px', fontWeight:700,
              boxShadow:'0 6px 18px rgba(37,211,102,.38)',
              animation:'fadeSlide .25s ease-out',
            }}>
              <MessageCircle size={14} /> WhatsApp
            </button>
            <button onClick={onCopy} style={{
              background:'#FFFFFF', color:'#0B1120',
              padding:'11px 16px', borderRadius:'999px',
              border:'1.5px solid #D7C9A0', cursor:'pointer',
              display:'inline-flex', alignItems:'center', gap:'7px',
              fontFamily:SANS, fontSize:'13px', fontWeight:700,
              boxShadow:'0 6px 18px rgba(15,23,42,.12)',
              animation:'fadeSlide .25s ease-out',
            }}>
              {copied ? <><Check size={14} color="#15803D" /> Copied</> : <><Copy size={14} /> Copy link</>}
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ─── Margin Page ──────────────────────────────────────────────────────────────
function MarginPage({ navigate, spot }) {
  const calcRate = spot.raw ?? SPOT_FALLBACK;

  const [ornaments,     setOrnaments]     = useState(() => [blankOrnament()]);
  const [serviceFee,    setServiceFee]    = useState('');
  const [revisedTotal,  setRevisedTotal]  = useState('');
  const [mobile,        setMobile]        = useState('');
  const [collapsed,     setCollapsed]     = useState(new Set());
  const [showBreakdown, setShowBreakdown] = useState(false);

  const isMulti = ornaments.length > 1;
  const feeN    = parseNum(serviceFee) ?? 0;
  const revN    = parseNum(revisedTotal);

  const ornamentData = useMemo(() => ornaments.map(o => {
    const g   = parseNum(o.gross);
    const s   = parseNum(o.stone)   ?? 0;
    const w   = parseNum(o.wastage) ?? 0;
    const p   = parseNum(o.purity);
    const ppg = parseNum(o.pricePerGram);
    const netWeight = g !== null ? g - s - w : null;
    const netError  = g !== null && netWeight !== null && netWeight <= 0;
    const isValid   = netWeight !== null && netWeight > 0 && p !== null && p > 0 && p <= 100 && ppg !== null && ppg > 0;
    let purchaseContrib = null, salesContrib = null, effRate = null;
    if (isValid) {
      const purity      = p / 100;
      const recoverable = netWeight + STONE_RECOVERY * s + WASTAGE_RECOVERY * w;
      purchaseContrib   = netWeight * ppg;
      salesContrib      = recoverable * purity * calcRate;
      effRate           = ppg / purity;
    }
    return { id: o.id, gross: g, stone: s, wastage: w, purity: p, ppg, netWeight, netError, isValid, purchaseContrib, salesContrib, effRate };
  }), [ornaments, calcRate]);

  const margin1 = useMemo(() => {
    const valid = ornamentData.filter(d => d.isValid);
    if (!valid.length) return null;
    const fee            = feeN / 100;
    const sumPurchaseRaw = valid.reduce((a, d) => a + d.purchaseContrib, 0);
    const sumSales       = valid.reduce((a, d) => a + d.salesContrib, 0);
    const sumNetPurity   = valid.reduce((a, d) => a + d.netWeight * (d.purity / 100), 0);
    const purchase_total = sumPurchaseRaw * (1 - fee);
    return {
      value: (1 - purchase_total / sumSales) * 100,
      eff:   purchase_total / sumNetPurity,
      total: purchase_total, purchase_total, sales_total: sumSales,
      ornamentCount: valid.length,
      totalNetWeight: valid.reduce((a, d) => a + d.netWeight, 0),
    };
  }, [ornamentData, feeN]);

  const margin2 = useMemo(() => {
    if (revN === null || revN <= 0) return null;
    const valid = ornamentData.filter(d => d.isValid);
    if (!valid.length) return null;
    const sumSales     = valid.reduce((a, d) => a + d.salesContrib, 0);
    const sumNetPurity = valid.reduce((a, d) => a + d.netWeight * (d.purity / 100), 0);
    return { value: (1 - revN / sumSales) * 100, eff: revN / sumNetPurity, total: revN, purchase_total: revN, sales_total: sumSales };
  }, [revN, ornamentData]);

  const lotSummary = useMemo(() => {
    const w = ornamentData.filter(d => d.netWeight !== null && d.netWeight > 0);
    if (!w.length) return null;
    return { ornamentCount: ornaments.length, totalGross: w.reduce((a, d) => a + d.gross, 0), totalNet: w.reduce((a, d) => a + d.netWeight, 0) };
  }, [ornamentData, ornaments.length]);

  const showLotSticky = isMulti && lotSummary !== null && margin1 === null;
  const stickyVisible = margin1 !== null || showLotSticky;

  const [activeSection, setActiveSection] = useState('first');
  const revisedObserverRef = useRef(null);
  const attachRevisedObserver = useCallback(node => {
    if (revisedObserverRef.current) { revisedObserverRef.current.disconnect(); revisedObserverRef.current = null; }
    if (!node) return;
    const io = new IntersectionObserver(([e]) => setActiveSection(e.intersectionRatio > 0.35 ? 'revised' : 'first'), { threshold: [0, 0.35, 0.6] });
    io.observe(node);
    revisedObserverRef.current = io;
  }, []);
  useEffect(() => () => revisedObserverRef.current?.disconnect(), []);

  const anyNetError  = ornamentData.some(d => d.netError);
  const progressText = (() => {
    if (anyNetError) return "Stone + wastage can't exceed gross. Check the numbers.";
    if (margin1 !== null) return null;
    if (!isMulti) {
      const d       = ornamentData[0];
      const missing = 3 - [d.gross, d.purity, d.ppg].filter(v => v !== null && v > 0).length;
      if (missing === 3) return "Fill in what your buyer told you. We'll do the math.";
      if (missing === 2) return "Keep going. 2 more fields to reveal the margin.";
      if (missing === 1) return "Almost there. One last field.";
    }
    return "Complete at least one ornament to see the margin.";
  })();
  const filled = !isMulti ? [ornamentData[0].gross, ornamentData[0].purity, ornamentData[0].ppg].filter(v => v !== null && v > 0).length : 0;

  const tone = v => {
    if (v == null) return { fg:'#64748B', bg:'#F1F5F9', label:'' };
    if (v < 0)    return { fg:'#991B1B', bg:'#FEE2E2', label:'Above spot — verify this' };
    if (v < 6)    return { fg:'#15803D', bg:'#DCFCE7', label:'Fair margin' };
    if (v < 10)   return { fg:'#B45309', bg:'#FEF3C7', label:'On the higher side' };
    if (v < 15)   return { fg:'#B91C1C', bg:'#FEE2E2', label:'High — push back' };
    return               { fg:'#991B1B', bg:'#FEE2E2', label:'Very high — push back hard' };
  };

  const updateOrnament = (id, field, value) => setOrnaments(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
  const addOrnament    = () => {
    if (ornaments.length >= MAX_ORNAMENTS) return;
    const validIds = ornamentData.filter(d => d.isValid).map(d => d.id);
    setCollapsed(prev => new Set([...prev, ...validIds]));
    setOrnaments(prev => [...prev, blankOrnament()]);
  };
  const removeOrnament = id => {
    if (ornaments.length <= 1) return;
    setOrnaments(prev => prev.filter(o => o.id !== id));
    setCollapsed(prev => { const n = new Set(prev); n.delete(id); return n; });
  };
  const toggleCollapse = id => setCollapsed(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const setWeightF = (id, field, v) => { if (v === '') return updateOrnament(id, field, ''); const n = parseFloat(v); if (isNaN(n) || n < 0) return; updateOrnament(id, field, v); };
  const setPurityF = (id, v)         => { if (v === '') return updateOrnament(id, 'purity', ''); const n = parseFloat(v); if (isNaN(n) || n < 0 || n > 100) return; updateOrnament(id, 'purity', v); };
  const setPriceF  = (id, v)         => { if (v === '') return updateOrnament(id, 'pricePerGram', ''); const [i] = String(v).split('.'); if (i.replace('-','').length > 5) return; const n = parseFloat(v); if (isNaN(n) || n < 0) return; updateOrnament(id, 'pricePerGram', v); };
  const setFeeG    = v               => { if (v === '') return setServiceFee(''); const n = parseFloat(v); if (isNaN(n) || n < 0 || n > 10) return; setServiceFee(v); };
  const setRevG    = v               => { if (v === '') return setRevisedTotal(''); const n = parseFloat(v); if (isNaN(n) || n < 0) return; setRevisedTotal(v); };
  const setMobileG  = v              => setMobile(v.replace(/\D/g, '').slice(0, 10));
  const mobileValid = mobile.length === 10 && /^[6-9]/.test(mobile);

  const onCTA = () => {
    if (!mobileValid) return;
    const body = ['Hi Carat Money — I used the margin checker.', ''];
    if (isMulti && margin1) {
      body.push(`Lot: ${margin1.ornamentCount} ornaments · ${fmt(margin1.totalNetWeight)}g net total`);
      ornamentData.filter(d => d.isValid).forEach((d, i) => body.push(`  ${i+1}. ${fmt(d.netWeight)}g net · ${d.purity}% · ₹${fmt(d.ppg,0)}/g`));
    } else {
      const d = ornamentData[0];
      body.push(`Gross: ${d.gross??'—'}g · Stone: ${d.stone}g · Wastage: ${d.wastage}g`);
      body.push(`Net: ${d.netWeight?fmt(d.netWeight):'—'}g @ ${d.purity??'—'}% purity`);
      body.push(`Buyer's offer: ₹${d.ppg?fmt(d.ppg,0):'—'}/g`);
    }
    body.push(`Service fee: ${feeN}%`);
    if (margin1) body.push(`Buyer quote: ${margin1.value.toFixed(1)}% margin · ₹${fmt(margin1.total,0)}`);
    if (revN)    body.push(`Revised offer: ₹${fmt(revN,0)} total`);
    if (margin2) body.push(`Revised margin: ${margin2.value.toFixed(1)}%`);
    body.push('', `My number: +91${mobile}`, 'Would like a better quote, please.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body.join('\n'))}`, '_blank');
  };

  const S = {
    stickyWrap:      { position:'fixed', top:0, left:0, right:0, zIndex:50, background:'rgba(251,246,236,0.92)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', borderBottom:'1px solid rgba(184,134,11,.14)', boxShadow:'0 1px 12px rgba(15,23,42,.05)' },
    stickyInner:     { maxWidth:'520px', margin:'0 auto', padding:'11px 18px 11px 16px', display:'flex', alignItems:'center', gap:'10px', borderLeft:'3px solid #B8860B', minHeight:'52px', boxSizing:'border-box' },
    stickyLabel:     { fontSize:'9.5px', fontWeight:800, letterSpacing:'0.14em', color:'#8B6508', flexShrink:0 },
    stickyDot:       { width:'3px', height:'3px', borderRadius:'50%', background:'#CBB87E', flexShrink:0 },
    stickyMargin:    c => ({ fontFamily:SERIF, fontSize:'20px', fontWeight:700, color:c, letterSpacing:'-0.02em', lineHeight:1, flexShrink:0 }),
    stickyDelta:     { fontSize:'10.5px', fontWeight:700, color:'#334155', display:'inline-flex', alignItems:'center', gap:'2px', flexShrink:0 },
    stickyAmount:    { fontFamily:SERIF, fontSize:'14px', fontWeight:600, color:'#0B1120', marginLeft:'auto', flexShrink:0, letterSpacing:'-0.01em' },
    stickyLotData:   { fontFamily:SERIF, fontSize:'14px', fontWeight:600, color:'#334155', letterSpacing:'-0.01em', flexShrink:0, lineHeight:1 },
    stickyLotNet:    { fontFamily:SERIF, fontSize:'15px', fontWeight:700, color:'#0B1120', letterSpacing:'-0.02em', flexShrink:0, lineHeight:1, marginLeft:'auto' },
    stickyLotInline: { fontFamily:SANS, fontSize:'12px', fontWeight:600, color:'#475569', marginLeft:'auto', flexShrink:0, letterSpacing:'0.005em', lineHeight:1 },
    card:            { background:'#FFFFFF', borderRadius:'20px', padding:'22px', boxShadow:'0 1px 2px rgba(15,23,42,.04),0 10px 30px rgba(15,23,42,.05)', marginBottom:'14px', border:'1px solid rgba(15,23,42,.04)' },
    cardLabel:       { fontSize:'10.5px', fontWeight:800, letterSpacing:'0.14em', color:'#94A3B8', marginBottom:'18px' },
    ornamentWrap:    idx => ({ paddingTop:idx===0?0:'20px', marginTop:idx===0?0:'20px', borderTop:idx===0?'none':'1px dashed #E2E8F0' }),
    ornamentHeader:  c => ({ display:'flex', alignItems:'center', gap:'10px', marginBottom:c?0:'14px', cursor:'pointer', userSelect:'none' }),
    ornamentBadge:   { display:'inline-flex', alignItems:'center', justifyContent:'center', width:'22px', height:'22px', borderRadius:'50%', background:'#FAF2DC', color:'#8B6508', fontFamily:SERIF, fontSize:'12px', fontWeight:700, flexShrink:0 },
    ornamentTitle:   { fontSize:'14px', fontWeight:700, color:'#0B1120', letterSpacing:'-0.01em' },
    ornamentSummary: { fontSize:'12.5px', color:'#64748B', fontWeight:500, marginLeft:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0 },
    ornamentActions: { marginLeft:'auto', display:'flex', alignItems:'center', gap:'4px', flexShrink:0 },
    iconBtn:         { background:'transparent', border:'none', padding:'6px', borderRadius:'8px', cursor:'pointer', color:'#94A3B8', display:'inline-flex', alignItems:'center', justifyContent:'center', transition:'background .15s,color .15s' },
    field:           { marginBottom:'16px' },
    fieldLast:       { marginBottom:0 },
    fieldRow:        { display:'flex', gap:'10px', marginBottom:'16px' },
    fieldHalf:       { flex:1, minWidth:0 },
    labelRow:        { display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'6px', gap:'8px' },
    label:           { fontSize:'13.5px', fontWeight:600, color:'#1F2937' },
    unit:            { fontSize:'11.5px', color:'#94A3B8', fontWeight:500, textAlign:'right' },
    input:           { width:'100%', padding:'13px 14px', fontSize:'16px', border:'1.5px solid #E2E8F0', borderRadius:'12px', background:'#FFFFFF', color:'#0B1120', fontWeight:500, outline:'none', boxSizing:'border-box', transition:'border-color .15s,box-shadow .15s', WebkitAppearance:'none', fontFamily:SANS },
    inputReadOnly:   { background:'#FAF7EF', color:'#0B1120', fontWeight:700, border:'1.5px dashed #D7C9A0', fontSize:'16px', padding:'13px 14px', borderRadius:'12px', minHeight:'46px', display:'flex', alignItems:'center', boxSizing:'border-box' },
    inputError:      { borderColor:'#DC2626', color:'#DC2626' },
    inputWithPrefix: { position:'relative' },
    prefix:          { position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:'#475569', fontWeight:600, pointerEvents:'none' },
    helper:          { fontSize:'12px', color:'#64748B', marginTop:'7px', lineHeight:1.5, display:'flex', alignItems:'flex-start', gap:'5px' },
    helperTop:       { fontSize:'13px', color:'#475569', lineHeight:1.5 },
    errorText:       { fontSize:'12px', color:'#DC2626', marginTop:'6px', fontWeight:500 },
    addBtn:          { width:'100%', marginTop:'18px', padding:'13px', background:'#FAF2DC', color:'#8B6508', border:'1.5px dashed #D7C9A0', borderRadius:'12px', fontSize:'14px', fontWeight:700, fontFamily:SANS, cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px', transition:'background .15s,border-color .15s' },
    maxHint:         { marginTop:'14px', padding:'12px 14px', background:'#FEF9EC', borderRadius:'10px', fontSize:'12.5px', color:'#64748B', textAlign:'center', lineHeight:1.55 },
    maxHintLink:     { color:'#8B6508', fontWeight:700, textDecoration:'none', borderBottom:'1px solid rgba(184,134,11,.3)' },
    feeBlock:        { marginTop:'22px', paddingTop:'20px', borderTop:'1px solid #EEF2F6' },
    effBlock:        { background:'#FAF7EF', border:'1px dashed #D7C9A0', borderRadius:'12px', padding:'14px 16px', textAlign:'center', width:'100%', boxSizing:'border-box', marginTop:'2px' },
    effRowWrap:      { display:'flex', flexWrap:'wrap', justifyContent:'center', alignItems:'baseline', gap:'12px 26px' },
    effCol:          { textAlign:'center' },
    effColLabel:     { fontSize:'9.5px', fontWeight:800, letterSpacing:'0.12em', color:'#8B6508', marginBottom:'5px' },
    effAmount:       { fontFamily:SERIF, fontSize:'36px', fontWeight:700, color:'#0B1120', letterSpacing:'-0.025em', lineHeight:1 },
    effRate:         { fontFamily:SERIF, fontSize:'22px', fontWeight:600, color:'#0B1120', letterSpacing:'-0.02em', lineHeight:1 },
    effUnit:         { fontSize:'13px', color:'#64748B', fontWeight:500, marginLeft:'1px' },
    blendedNote:     { fontSize:'10.5px', color:'#94A3B8', marginTop:'4px', fontStyle:'italic', letterSpacing:'0.02em' },
    marginDivider:   { width:'44px', height:'1px', background:'#E2E8F0', margin:'6px auto 2px' },
    effBlockInline:  { background:'rgba(255,255,255,.55)', borderRadius:'10px', padding:'12px 14px', marginBottom:'10px', marginTop:'2px' },
    effColLabelI:    { fontSize:'9px', fontWeight:800, letterSpacing:'0.12em', color:'#475569', marginBottom:'3px' },
    effAmountInline: { fontFamily:SERIF, fontSize:'28px', fontWeight:700, color:'#0B1120', letterSpacing:'-0.02em', lineHeight:1 },
    effRateInline:   { fontFamily:SERIF, fontSize:'18px', fontWeight:600, color:'#0B1120', letterSpacing:'-0.02em', lineHeight:1 },
    breakdownBtn:    { marginTop:'14px', background:'transparent', border:'none', color:'#8B6508', fontSize:'12px', fontWeight:700, fontFamily:SANS, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 8px', borderRadius:'6px', letterSpacing:'0.1em' },
    breakdownList:   { marginTop:'14px', width:'100%', textAlign:'left', animation:'fadeSlide .3s ease-out' },
    breakdownRow:    { padding:'14px 0', borderTop:'1px dashed #E2E8F0' },
    breakdownRow0:   { borderTop:'none', paddingTop:0 },
    breakdownHead:   { fontSize:'11px', fontWeight:800, letterSpacing:'0.14em', color:'#8B6508', marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px' },
    breakdownBadge:  { display:'inline-flex', alignItems:'center', justifyContent:'center', width:'20px', height:'20px', borderRadius:'50%', background:'#FAF2DC', color:'#8B6508', fontFamily:SERIF, fontSize:'11px', fontWeight:700 },
    breakdownGrid:   { display:'grid', gridTemplateColumns:'1fr 1fr', rowGap:'10px', columnGap:'18px' },
    breakdownItem:   { display:'flex', flexDirection:'column', gap:'2px' },
    breakdownILabel: { fontSize:'10.5px', color:'#94A3B8', fontWeight:600, letterSpacing:'0.04em' },
    breakdownIValue: { fontSize:'14px', color:'#0B1120', fontWeight:700, fontFamily:SERIF, letterSpacing:'-0.01em' },
    breakdownTotal:  { marginTop:'14px', paddingTop:'16px', borderTop:'1px solid #D7C9A0' },
    breakdownTHead:  { fontSize:'11px', fontWeight:800, letterSpacing:'0.14em', color:'#8B6508', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' },
    breakdownTBadge: { display:'inline-flex', alignItems:'center', justifyContent:'center', width:'20px', height:'20px', borderRadius:'50%', background:'#B8860B', color:'#FFFFFF', fontFamily:SERIF, fontSize:'11px', fontWeight:700, letterSpacing:0 },
    marginCard:      { textAlign:'center', padding:'30px 20px', minHeight:'180px', display:'flex', alignItems:'center', justifyContent:'center', background:'#FFFFFF' },
    ghost:           { display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' },
    ghostText:       { fontFamily:SERIF, fontSize:'17px', color:'#475569', fontWeight:500, maxWidth:'300px', lineHeight:1.45, fontStyle:'italic', animation:'pulse 2.4s ease-in-out infinite' },
    dots:            { display:'flex', gap:'6px', marginTop:'2px' },
    dot:             on => ({ width:'26px', height:'4px', borderRadius:'4px', background:on?'#B8860B':'#E7DFCB', transition:'background .3s' }),
    revealed:        { display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', width:'100%', animation:'fadeSlide .45s cubic-bezier(.2,.8,.2,1)' },
    labelTop:        { fontSize:'10.5px', fontWeight:800, letterSpacing:'0.14em', color:'#94A3B8', textAlign:'center' },
    bigNumber:       c => ({ fontFamily:SERIF, fontSize:'68px', fontWeight:700, lineHeight:1, letterSpacing:'-0.04em', color:c, fontVariationSettings:"'opsz' 144" }),
    badge:           t => ({ fontSize:'12px', fontWeight:700, padding:'6px 12px', borderRadius:'999px', background:t.bg, color:t.fg, letterSpacing:'0.01em' }),
    inline:          t => ({ marginTop:'14px', padding:'16px', borderRadius:'14px', textAlign:'center', background:t.bg, animation:'fadeSlide .3s ease-out' }),
    inlineLabel:     { fontSize:'10.5px', fontWeight:800, letterSpacing:'0.14em', color:'#64748B', marginBottom:'4px' },
    inlineNumber:    c => ({ fontFamily:SERIF, fontSize:'40px', fontWeight:700, lineHeight:1, letterSpacing:'-0.03em', color:c }),
    delta:           { fontSize:'12.5px', marginTop:'6px', fontWeight:600, color:'#334155', display:'inline-flex', alignItems:'center', gap:'4px' },
    ctaCard:         { background:'linear-gradient(150deg,#0B1120 0%,#1E293B 100%)', color:'#FFFFFF', borderRadius:'20px', padding:'26px 22px', marginBottom:'14px', boxShadow:'0 14px 40px rgba(15,23,42,.22)', position:'relative', overflow:'hidden' },
    ctaGlow:         { position:'absolute', top:'-60px', right:'-60px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle,rgba(184,134,11,.25) 0%,transparent 70%)', pointerEvents:'none' },
    ctaHeadline:     { fontFamily:SERIF, fontSize:'26px', fontWeight:700, letterSpacing:'-0.02em', marginBottom:'10px', color:'#FFFFFF', position:'relative' },
    ctaBody:         { fontSize:'14.5px', color:'#CBD5E1', lineHeight:1.6, marginBottom:'18px', position:'relative' },
    mobileWrap:      { display:'flex', alignItems:'center', background:'#FFFFFF', borderRadius:'12px', padding:'0 0 0 14px', overflow:'hidden', marginBottom:'12px', position:'relative' },
    mobilePrefix:    { fontSize:'16px', color:'#64748B', fontWeight:600, paddingRight:'10px', borderRight:'1px solid #E2E8F0' },
    mobileInput:     { flex:1, border:'none', background:'transparent', padding:'14px', fontSize:'16px', fontWeight:600, color:'#0B1120', outline:'none', minWidth:0, WebkitAppearance:'none', fontFamily:SANS },
    ctaButton:       en => ({ width:'100%', padding:'15px', background:'#25D366', color:'#FFFFFF', border:'none', borderRadius:'12px', fontSize:'16px', fontWeight:700, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'opacity .2s,transform .1s', boxShadow:'0 6px 18px rgba(37,211,102,.38)', opacity:en?1:0.5, cursor:en?'pointer':'not-allowed', position:'relative' }),
    ctaDisclaimer:   { fontSize:'11.5px', color:'#94A3B8', marginTop:'12px', textAlign:'center', lineHeight:1.5, position:'relative' },
  };

  const t1 = tone(margin1?.value);
  const t2 = tone(margin2?.value);
  const collapsedSummary = d => !d.isValid ? 'Incomplete' : `${fmt(d.netWeight)}g · ${d.purity}% · ₹${fmt(d.ppg,0)}/g`;

  return (
    <div style={{ minHeight:'100dvh', background:BG, fontFamily:SANS, color:'#0B1120', paddingTop:stickyVisible?'52px':0, transition:'padding-top .3s ease' }}>

      {stickyVisible && (
        <div style={{ ...S.stickyWrap, animation:'stickyDrop .35s cubic-bezier(.2,.8,.2,1)' }}>
          <div style={S.stickyInner}>
            {margin1 === null ? (
              <div key="lot" style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', animation:'stickySwap .25s ease-out' }}>
                <span style={S.stickyLabel}>{lotSummary.ornamentCount} ORNAMENTS</span>
                <span style={S.stickyDot} />
                <span style={S.stickyLotData}>{fmt(lotSummary.totalGross)}g gross</span>
                <span style={S.stickyDot} />
                <span style={S.stickyLotNet}>{fmt(lotSummary.totalNet)}g net</span>
              </div>
            ) : (() => {
              const showRevised = activeSection === 'revised' && margin2 !== null;
              const t   = showRevised ? t2 : t1;
              const m   = showRevised ? margin2 : margin1;
              const key = showRevised ? 'r' : 'f';
              const delta = showRevised && margin1 ? margin1.value - margin2.value : null;
              return (
                <div key={key} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', animation:'stickySwap .25s ease-out' }}>
                  <span style={S.stickyLabel}>{showRevised ? 'REVISED' : 'BUYER QUOTE'}</span>
                  <span style={S.stickyDot} />
                  <span style={S.stickyMargin(t.fg)}>{m.value.toFixed(1)}%</span>
                  {delta !== null && (
                    <span style={S.stickyDelta}><TrendingDown size={11} />{delta > 0 ? `${delta.toFixed(1)}pp` : 'no drop'}</span>
                  )}
                  {isMulti
                    ? <span style={S.stickyLotInline}>{margin1.ornamentCount} ornaments · {fmt(margin1.totalNetWeight)}g net</span>
                    : <span style={S.stickyAmount}>₹{fmt(m.total,0)}</span>
                  }
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 14px 40px' }}>
        <BackBtn navigate={navigate} />

        <div style={{ textAlign:'center', padding:'10px 6px 20px' }}>
          <h1 style={{ fontFamily:SERIF, fontSize:'34px', fontWeight:700, lineHeight:1.08, letterSpacing:'-0.02em', margin:0, color:'#0B1120', fontVariationSettings:"'opsz' 144" }}>
            Check your gold buyer's <span style={{ color:'#8B6508', fontStyle:'italic' }}>margin</span>
          </h1>
          <p style={{ fontSize:'15px', color:'#475569', marginTop:'12px', lineHeight:1.55, maxWidth:'420px', marginLeft:'auto', marginRight:'auto' }}>
            Before you sell, see exactly what they're keeping above today's spot price.
          </p>
        </div>

        <div style={S.card}>
          <div style={S.cardLabel}>{isMulti ? `YOUR LOT · ${ornaments.length} ORNAMENTS` : 'WHAT YOUR BUYER TOLD YOU'}</div>

          {ornaments.map((o, idx) => {
            const d = ornamentData[idx];
            const isCollapsed = isMulti && collapsed.has(o.id);
            return (
              <div key={o.id} style={S.ornamentWrap(idx)}>
                {isMulti && (
                  <div style={S.ornamentHeader(isCollapsed)} onClick={() => toggleCollapse(o.id)}>
                    <span style={S.ornamentBadge}>{idx+1}</span>
                    <span style={S.ornamentTitle}>Ornament {idx+1}</span>
                    {isCollapsed && <span style={S.ornamentSummary}>· {collapsedSummary(d)}</span>}
                    <span style={S.ornamentActions}>
                      <button className="cm-icon" style={S.iconBtn} onClick={e=>{e.stopPropagation();toggleCollapse(o.id);}} aria-label={isCollapsed?'Expand':'Collapse'}>
                        {isCollapsed ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}
                      </button>
                      {ornaments.length > 1 && (
                        <button className="cm-icon cm-icon-danger" style={S.iconBtn} onClick={e=>{e.stopPropagation();removeOrnament(o.id);}} aria-label="Remove ornament">
                          <Trash2 size={15}/>
                        </button>
                      )}
                    </span>
                  </div>
                )}
                {!isCollapsed && (
                  <>
                    <div style={S.field}>
                      <div style={S.labelRow}><label style={S.label}>Gross weight</label><span style={S.unit}>grams · on weighing scale</span></div>
                      <input type="number" inputMode="decimal" placeholder="e.g. 10.25" value={o.gross} onChange={e=>setWeightF(o.id,'gross',e.target.value)} style={S.input}/>
                    </div>
                    <div style={S.fieldRow}>
                      <div style={S.fieldHalf}>
                        <div style={S.labelRow}><label style={S.label}>Stone</label><span style={S.unit}>grams</span></div>
                        <input type="number" inputMode="decimal" placeholder="0" value={o.stone} onChange={e=>setWeightF(o.id,'stone',e.target.value)} style={S.input}/>
                      </div>
                      <div style={S.fieldHalf}>
                        <div style={S.labelRow}><label style={S.label}>Wastage</label><span style={S.unit}>grams</span></div>
                        <input type="number" inputMode="decimal" placeholder="0" value={o.wastage} onChange={e=>setWeightF(o.id,'wastage',e.target.value)} style={S.input}/>
                      </div>
                    </div>
                    <div style={S.field}>
                      <div style={S.labelRow}><label style={S.label}>Net weight</label><span style={S.unit}>grams · auto-calculated</span></div>
                      <div style={{...S.inputReadOnly,...(d.netError?S.inputError:{})}}>{d.netWeight!==null?fmt(d.netWeight):'—'}</div>
                      {d.netError && <div style={S.errorText}>Net weight must be greater than zero.</div>}
                    </div>
                    <div style={S.field}>
                      <div style={S.labelRow}><label style={S.label}>Purity</label><span style={S.unit}>% · up to 2 decimals</span></div>
                      <input type="number" inputMode="decimal" placeholder="e.g. 91.60" step="0.01" value={o.purity} onChange={e=>setPurityF(o.id,e.target.value)} style={S.input}/>
                      <div style={S.helper}><Info size={12} style={{flexShrink:0,marginTop:'1px'}}/><span>Ask the buyer to show you the exact reading on their purity machine.</span></div>
                    </div>
                    <div style={{...S.field,...S.fieldLast}}>
                      <div style={S.labelRow}><label style={S.label}>Purchase price per gram</label><span style={S.unit}>₹ · per gram at stated purity</span></div>
                      <div style={S.inputWithPrefix}>
                        <span style={S.prefix}>₹</span>
                        <input type="number" inputMode="decimal" placeholder="e.g. 13500" value={o.pricePerGram} onChange={e=>setPriceF(o.id,e.target.value)} style={{...S.input,paddingLeft:'30px'}}/>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {ornaments.length < MAX_ORNAMENTS && (
            <button className="cm-add" style={S.addBtn} onClick={addOrnament}><Plus size={16}/>Add another ornament</button>
          )}
          {ornaments.length >= MAX_ORNAMENTS && (
            <div style={S.maxHint}>
              Maximum {MAX_ORNAMENTS} ornaments in the tool.{' '}
              For larger lots, <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Carat Money — I have more than 10 ornaments to sell.")}`} target="_blank" rel="noreferrer" style={S.maxHintLink}>WhatsApp us directly</a>.
            </div>
          )}

          <div style={S.feeBlock}>
            <div style={{...S.field,...S.fieldLast}}>
              <div style={S.labelRow}><label style={S.label}>Service fee</label><span style={S.unit}>% · max 10%{isMulti?' · applied to full lot':''}</span></div>
              <input type="number" inputMode="decimal" placeholder="e.g. 3" step="0.1" max="10" value={serviceFee} onChange={e=>setFeeG(e.target.value)} style={S.input}/>
            </div>
          </div>
        </div>

        <div style={{...S.card,...S.marginCard}}>
          {margin1 === null ? (
            <div style={S.ghost}>
              <Sparkles size={22} color="#B8860B" style={{opacity:0.55}}/>
              <div style={S.ghostText}>{progressText}</div>
              {!isMulti && <div style={S.dots}>{[0,1,2].map(i=><div key={i} style={S.dot(i<filled)}/>)}</div>}
            </div>
          ) : (
            <div style={S.revealed}>
              <div style={S.labelTop}>BUYER'S MARGIN · BUYER QUOTE{isMulti?` · ${margin1.ornamentCount} ORNAMENTS`:''}</div>
              <div style={S.effBlock}>
                <div style={S.effRowWrap}>
                  <div style={S.effCol}>
                    <div style={S.effColLabel}>YOU RECEIVE</div>
                    <div style={S.effAmount}>₹{fmt(margin1.total,0)}</div>
                  </div>
                  <div style={S.effCol}>
                    <div style={S.effColLabel}>{isMulti?'BLENDED 24K RATE':'EFFECTIVE 24K RATE'}</div>
                    <div style={S.effRate}>₹{fmt(margin1.eff,0)}<span style={S.effUnit}>/g</span></div>
                  </div>
                </div>
                {isMulti && <div style={S.blendedNote}>Weighted across {margin1.ornamentCount} ornaments · after {feeN}% fee</div>}
              </div>
              <div style={S.marginDivider}/>
              <div style={S.bigNumber(t1.fg)}>{margin1.value.toFixed(1)}%</div>
              <div style={S.badge(t1)}>{t1.label}</div>

              {isMulti && (
                <>
                  <button style={S.breakdownBtn} onClick={()=>setShowBreakdown(v=>!v)}>
                    {showBreakdown?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
                    {showBreakdown?'HIDE BREAKDOWN':'SEE PER-ORNAMENT BREAKDOWN'}
                  </button>
                  {showBreakdown && (
                    <div style={S.breakdownList}>
                      {ornamentData.filter(x=>x.isValid).map((d,i)=>{
                        const fee=feeN/100, effPF=d.effRate*(1-fee), contribPF=d.purchaseContrib*(1-fee);
                        return (
                          <div key={d.id} style={{...S.breakdownRow,...(i===0?S.breakdownRow0:{})}}>
                            <div style={S.breakdownHead}><span style={S.breakdownBadge}>{i+1}</span>ORNAMENT {i+1}</div>
                            <div style={S.breakdownGrid}>
                              <div style={S.breakdownItem}><span style={S.breakdownILabel}>Net weight</span><span style={S.breakdownIValue}>{fmt(d.netWeight)}g</span></div>
                              <div style={S.breakdownItem}><span style={S.breakdownILabel}>Purity</span><span style={S.breakdownIValue}>{d.purity}%</span></div>
                              <div style={S.breakdownItem}><span style={S.breakdownILabel}>24K rate (post-fee)</span><span style={S.breakdownIValue}>₹{fmt(effPF,0)}/g</span></div>
                              <div style={S.breakdownItem}><span style={S.breakdownILabel}>Sub-total</span><span style={S.breakdownIValue}>₹{fmt(contribPF,0)}</span></div>
                            </div>
                          </div>
                        );
                      })}
                      {(()=>{
                        const valid=ornamentData.filter(x=>x.isValid);
                        const tG=valid.reduce((a,d)=>a+d.gross,0), tN=valid.reduce((a,d)=>a+d.netWeight,0), tD=valid.reduce((a,d)=>a+d.stone+d.wastage,0);
                        return (
                          <div style={S.breakdownTotal}>
                            <div style={S.breakdownTHead}><span style={S.breakdownTBadge}>Σ</span>TOTAL LOT</div>
                            <div style={S.breakdownGrid}>
                              <div style={S.breakdownItem}><span style={S.breakdownILabel}>Gross weight</span><span style={S.breakdownIValue}>{fmt(tG)}g</span></div>
                              <div style={S.breakdownItem}><span style={S.breakdownILabel}>Total deducted</span><span style={S.breakdownIValue}>{fmt(tD)}g</span></div>
                              <div style={S.breakdownItem}><span style={S.breakdownILabel}>Net weight</span><span style={S.breakdownIValue}>{fmt(tN)}g</span></div>
                              <div style={S.breakdownItem}><span style={S.breakdownILabel}>You receive</span><span style={S.breakdownIValue}>₹{fmt(margin1.total,0)}</span></div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {margin1!==null && (
          <div ref={attachRevisedObserver} style={{...S.card,animation:'fadeSlide .5s ease-out'}}>
            <div style={S.cardLabel}>DID THEY REVISE THE OFFER?</div>
            <div style={S.helperTop}>Buyers usually negotiate. Enter the revised <b>total</b> they're offering{isMulti?' for the full lot':''} — the final amount you'd receive.</div>
            <div style={{...S.field,...S.fieldLast,marginTop:'16px'}}>
              <div style={S.labelRow}><label style={S.label}>Revised total offer</label><span style={S.unit}>₹ · total, not per gram</span></div>
              <div style={S.inputWithPrefix}>
                <span style={S.prefix}>₹</span>
                <input type="number" inputMode="decimal" placeholder="e.g. 13800" value={revisedTotal} onChange={e=>setRevG(e.target.value)} style={{...S.input,paddingLeft:'30px'}}/>
              </div>
            </div>
            {margin2!==null && (
              <div style={S.inline(t2)}>
                <div style={S.inlineLabel}>REVISED OFFER</div>
                <div style={S.effBlockInline}>
                  <div style={S.effRowWrap}>
                    <div style={S.effCol}><div style={S.effColLabelI}>YOU RECEIVE</div><div style={S.effAmountInline}>₹{fmt(margin2.total,0)}</div></div>
                    <div style={S.effCol}><div style={S.effColLabelI}>{isMulti?'BLENDED 24K RATE':'EFFECTIVE 24K RATE'}</div><div style={S.effRateInline}>₹{fmt(margin2.eff,0)}/g</div></div>
                  </div>
                </div>
                <div style={S.inlineNumber(t2.fg)}>{margin2.value.toFixed(1)}%</div>
                <div style={S.delta}>
                  {margin2.value<margin1.value
                    ? <><TrendingDown size={13}/>Margin dropped by {(margin1.value-margin2.value).toFixed(1)} pp</>
                    : <>No improvement — keep pushing</>
                  }
                </div>
              </div>
            )}
          </div>
        )}

        {margin1!==null && (
          <div style={{...S.ctaCard,animation:'fadeSlide .55s ease-out'}}>
            <div style={S.ctaGlow}/>
            <div style={S.ctaHeadline}>Want a better price?</div>
            <div style={S.ctaBody}>Share your number and we'll send you a quote on WhatsApp.</div>
            <div style={S.mobileWrap}>
              <span style={S.mobilePrefix}>+91</span>
              <input type="tel" inputMode="numeric" placeholder="10-digit mobile number" value={mobile} onChange={e=>setMobileG(e.target.value)} style={S.mobileInput}/>
            </div>
            <button onClick={onCTA} disabled={!mobileValid} style={S.ctaButton(mobileValid)}>
              <MessageCircle size={18}/> Get a better offer on WhatsApp
            </button>
            <div style={S.ctaDisclaimer}>By submitting, you agree to be contacted about your gold sale.</div>
          </div>
        )}

        {/* Share section — appears after margin reveal */}
        {margin1 !== null && <ShareSection inline />}
      </div>

      {/* Floating share pill — only after margin is calculated */}
      {margin1 !== null && <FloatingShareButton />}
    </div>
  );
}

// ─── App (router) ─────────────────────────────────────────────────────────────
export default function App() {
  const { route, navigate } = useRoute();
  const spot = useSpotRate();
  useSEO(route);

  let page;
  if      (route === '/sell')   page = <SellPage   navigate={navigate} spot={spot} />;
  else if (route === '/buy')    page = <BuyPage    navigate={navigate} spot={spot} />;
  else if (route === '/margin') page = <MarginPage navigate={navigate} spot={spot} />;
  else                          page = <HomePage   navigate={navigate} spot={spot} />;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {page}
    </>
  );
}
