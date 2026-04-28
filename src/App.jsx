import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, TrendingDown, Shield, Sparkles, Info,
  Plus, Minus, Trash2, ChevronDown, ChevronUp, ArrowLeft, Zap,
  KeyRound, Search, ShieldCheck, X, Share2, Copy, AlertCircle, Check,
} from 'lucide-react';

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const C = {
  plum:    '#2b1450',
  purple:  '#3a1d6e',
  ink:     '#16121f',
  ink2:    '#2a2338',
  paper:   '#f6f2ea',
  paper2:  '#ede6d8',
  gold:    '#b8883a',
  gold2:   '#e0b765',
  gold3:   '#f1d78d',
  mute:    '#7a6f62',
  white:   '#ffffff',
  green:   '#25D366',
};

// ─── Config ───────────────────────────────────────────────────────────────────
const SPOT_FALLBACK    = 15578;
const WHATSAPP_NUMBER  = '918618542353';
const STONE_RECOVERY   = 0.45;
const WASTAGE_RECOVERY = 0.80;
const MAX_ORNAMENTS    = 10;
const BUY_RATE_24K     = 15901;
const BUY_RATE_DATE    = '27 Apr 2026';

// ─── Typography ───────────────────────────────────────────────────────────────
const SERIF = "'Fraunces', Georgia, serif";
const SANS  = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO  = "'JetBrains Mono', 'Courier New', monospace";

// ─── Logo SVG ─────────────────────────────────────────────────────────────────
function LogoMark({ size = 90, color = C.gold2 }) {
  const s = size;
  const h = Math.round(s * 1.3);
  return (
    <svg viewBox="0 0 200 260" width={s} height={h} xmlns="http://www.w3.org/2000/svg">
      <path d="M100 20 C140 20 172 62 172 130 C172 198 140 240 100 240 C60 240 28 198 28 130 C28 62 60 20 100 20 Z"
        fill="none" stroke={color} strokeWidth="7"/>
      <path d="M100 32 C134 32 160 70 160 130 C160 190 134 228 100 228 C66 228 40 190 40 130 C40 70 66 32 100 32 Z"
        fill="none" stroke={color} strokeWidth="1.5" opacity="0.4"/>
      <text x="100" y="172" textAnchor="middle" fontFamily="Fraunces, serif"
        fontSize="140" fontStyle="italic" fill={color}>cm</text>
      <circle cx="100" cy="42" r="3" fill={color}/>
      <circle cx="100" cy="218" r="3" fill={color}/>
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, d = 2) => {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '—';
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
};
const parseNum = v => { if (v === '' || v == null) return null; const n = parseFloat(v); return isNaN(n) ? null : n; };
const makeId        = () => `o_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const blankOrnament = () => ({ id: makeId(), gross:'', stone:'', wastage:'', purity:'', pricePerGram:'' });
const fmtTime       = d => d ? d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : null;
const copyToClipboard = async t => { try { await navigator.clipboard.writeText(t); return true; } catch { return false; } };

// ─── Routing ──────────────────────────────────────────────────────────────────
function useRoute() {
  const get = () => window.location.pathname || '/';
  const [route, setRoute] = useState(get);
  useEffect(() => {
    const h = () => setRoute(get());
    window.addEventListener('popstate', h);
    return () => window.removeEventListener('popstate', h);
  }, []);
  const navigate = useCallback(path => {
    window.history.pushState({}, '', path);
    setRoute(get());
    window.scrollTo({ top:0, behavior:'instant' });
  }, []);
  return { route, navigate };
}

// ─── SEO ──────────────────────────────────────────────────────────────────────
const SEO_MAP = {
  '/':       { title:'Carat Money — The Fair Price for Gold', desc:'Get the best price for your gold in Bangalore. Trusted by 5,000+ customers. Live rates, instant WhatsApp quotes.' },
  '/sell':   { title:'Sell Gold to Carat Money | Best Buying Rates', desc:'Get an instant WhatsApp quote. We come to you. Trusted by 5,000+ sellers across India.' },
  '/buy':    { title:'Buy 24K Gold Coins | BIS-Hallmarked | Carat Money', desc:'Buy BIS-hallmarked 24K gold coins. 999.9 purity. 48-hour open-box delivery. WhatsApp to order.' },
  '/margin': { title:'Gold Buyer Margin Calculator | Free Tool by Carat Money', desc:'Free tool to check what your gold buyer is keeping above the spot rate. Used by 5,000+ sellers across India.' },
};
function useSEO(route) {
  useEffect(() => {
    const seo = SEO_MAP[route] || SEO_MAP['/'];
    document.title = seo.title;
    const em = (sel, attr, val, content) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    em('meta[property="og:url"]',        'property', 'og:url',          `https://carat.money${route}`);
    em('meta[name="description"]',       'name',     'description',     seo.desc);
    em('meta[property="og:title"]',      'property', 'og:title',        seo.title);
    em('meta[property="og:description"]','property', 'og:description',  seo.desc);
    em('meta[property="og:type"]',       'property', 'og:type',         'website');
  }, [route]);
}

// ─── Live spot rate ───────────────────────────────────────────────────────────
function useSpotRate() {
  const [spot, setSpot] = useState({ raw:null, display:null, updatedAt:null, loading:true, error:false });
  const fetch_ = useCallback(async () => {
    try {
      const res  = await fetch('/api/rate');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const raw     = Math.round(data.sellPerGram);
      const display = Math.round(raw * 1.03 * 0.975);
      setSpot({ raw, display, updatedAt: new Date(), loading:false, error:false });
    } catch (e) {
      console.warn('[spot]', e.message);
      setSpot(p => ({ ...p, loading:false, error:true }));
    }
  }, []);
  useEffect(() => { fetch_(); const id = setInterval(fetch_, 60_000); return () => clearInterval(id); }, [fetch_]);
  return spot;
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  * { -webkit-tap-highlight-color:transparent; box-sizing:border-box; }
  body { margin:0; background:${C.paper}; }
  @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes fadeSlide  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes stickyDrop { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes stickySwap { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp    { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
  @keyframes glowPulse  { 0%{box-shadow:0 0 0 0 rgba(224,183,101,.7)} 50%{box-shadow:0 0 0 14px rgba(224,183,101,0)} 100%{box-shadow:0 0 0 0 rgba(224,183,101,0)} }
  input:focus,textarea:focus { outline:none; border-color:${C.gold}!important; box-shadow:0 0 0 3px rgba(184,136,58,.14)!important; }
  button:active:not(:disabled) { transform:translateY(1px); }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  input[type=number] { -moz-appearance:textfield; }
`;

// ─── Shared input style ───────────────────────────────────────────────────────
const INP = {
  width:'100%', padding:'13px 14px', fontSize:'16px', lineHeight:1.4,
  border:`1.5px solid rgba(26,20,38,.18)`, borderRadius:'4px',
  background:C.white, color:C.ink, fontWeight:400,
  outline:'none', transition:'border-color .15s,box-shadow .15s',
  WebkitAppearance:'none', fontFamily:SANS, boxSizing:'border-box',
};
const LBL = { fontSize:'14px', fontWeight:600, color:C.ink2, display:'block', marginBottom:'7px', fontFamily:SANS };

// ─── Rate Strip ───────────────────────────────────────────────────────────────
function RateStrip({ spot }) {
  const r24 = spot.display ?? SPOT_FALLBACK;
  const r22 = Math.round(r24 * 22 / 24);
  return (
    <div style={{ background:C.plum, padding:'10px 18px', display:'flex', alignItems:'center', flexWrap:'wrap', gap:'6px 16px', fontFamily:MONO, fontSize:'11px' }}>
      <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontWeight:500, color:C.gold2, letterSpacing:'0.12em' }}>
        <Zap size={10} strokeWidth={2.5}/> LIVE RATE
      </span>
      {[{k:'24K',r:r24},{k:'22K',r:r22}].map(({k,r}) => (
        <span key={k} style={{ color:C.gold3, fontWeight:400, letterSpacing:'0.04em' }}>
          <span style={{ color:C.gold2, marginRight:'4px', fontSize:'9px', letterSpacing:'0.1em' }}>{k}</span>₹{fmt(r,0)}/g
        </span>
      ))}
    </div>
  );
}

// ─── Back Button ──────────────────────────────────────────────────────────────
function BackBtn({ navigate }) {
  return (
    <button onClick={() => navigate('/')} style={{ background:'none', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'6px', color:C.gold, fontFamily:MONO, fontSize:'12px', fontWeight:500, padding:'18px 0 8px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
      <ArrowLeft size={14} strokeWidth={2}/> Home
    </button>
  );
}

// ─── Eyebrow ──────────────────────────────────────────────────────────────────
const Eyebrow = ({ children, light }) => (
  <div style={{ fontFamily:MONO, fontSize:'10px', fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', color: light ? `rgba(241,215,141,0.6)` : C.mute, marginBottom:'10px' }}>{children}</div>
);

// ─── Primary CTA button ───────────────────────────────────────────────────────
const BtnPrimary = ({ onClick, disabled, children, style={} }) => (
  <button onClick={onClick} disabled={disabled} style={{ width:'100%', padding:'15px 20px', background: disabled ? C.paper2 : C.gold2, color: disabled ? C.mute : C.plum, border:'none', borderRadius:'4px', fontSize:'15px', fontWeight:600, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor: disabled ? 'not-allowed' : 'pointer', transition:'opacity .2s,transform .1s', letterSpacing:'0.01em', ...style }}>{children}</button>
);

// ─── WhatsApp CTA button ──────────────────────────────────────────────────────
const BtnWhatsApp = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled} style={{ width:'100%', padding:'15px 20px', background:C.green, color:C.white, border:'none', borderRadius:'999px', fontSize:'16px', fontWeight:600, fontFamily:SANS, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 6px 20px rgba(37,211,102,.32)', opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer', transition:'opacity .2s' }}>{children}</button>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card = React.forwardRef(({ children, dark, style={} }, ref) => (
  <div ref={ref} style={{ background: dark ? C.plum : C.white, borderRadius:'8px', border: dark ? `1px solid rgba(224,183,101,.2)` : `1px solid rgba(26,20,38,.1)`, padding:'24px', boxShadow: dark ? '0 8px 32px rgba(43,20,80,.18)' : '0 2px 12px rgba(22,18,31,.06)', ...style }}>{children}</div>
));

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ navigate, spot }) {
  const [showGstTip, setShowGstTip] = useState(false);
  const r24  = spot.display ?? SPOT_FALLBACK;
  const r22  = Math.round(r24 * 22 / 24);
  const time = fmtTime(spot.updatedAt);

  return (
    <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink }}>
      <RateStrip spot={spot}/>
      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 18px 48px' }}>

        <div style={{ textAlign:'center', padding:'40px 12px 32px' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'16px' }}>
            <LogoMark size={110} color={C.gold2}/>
          </div>
          <div style={{ fontFamily:SERIF, fontSize:'42px', fontWeight:350, color:C.ink, letterSpacing:'-0.02em', lineHeight:1.05, marginBottom:'6px' }}>
            Carat <span style={{ fontStyle:'italic', color:C.plum }}>Money</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', margin:'10px 0 20px' }}>
            <div style={{ height:'1px', width:'40px', background:C.gold, opacity:0.5 }}/>
            <div style={{ fontFamily:MONO, fontSize:'9px', letterSpacing:'0.2em', color:C.gold, textTransform:'uppercase' }}>· The Fair Price for Gold ·</div>
            <div style={{ height:'1px', width:'40px', background:C.gold, opacity:0.5 }}/>
          </div>
          <div style={{ fontFamily:SANS, fontSize:'14px', fontWeight:600, color:C.gold, letterSpacing:'0.01em', lineHeight:1.5, marginBottom:'4px' }}>
            We guarantee — nobody can match our price
          </div>
          <div style={{ fontFamily:MONO, fontSize:'11px', color:C.mute, letterSpacing:'0.06em' }}>
            5,000+ customers · ₹100Cr+ purchased · 4.9★
          </div>
        </div>

        <Card dark style={{ marginBottom:'14px' }}>
          <Eyebrow light>Carat Money's Buy Rate in Your City</Eyebrow>
          <div style={{ marginBottom:'4px' }}>
            {spot.loading && !spot.display
              ? <span style={{ fontFamily:SERIF, fontSize:'38px', color:`rgba(241,215,141,.4)`, letterSpacing:'-0.02em' }}>Loading…</span>
              : <>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
                    <span style={{ fontFamily:SERIF, fontSize:'48px', fontWeight:350, lineHeight:1, letterSpacing:'-0.03em', color:C.gold3 }}>₹{fmt(r24,0)}</span>
                    <span style={{ fontFamily:SANS, fontSize:'16px', color:`rgba(241,215,141,.6)` }}>/g · 24K</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'8px', marginTop:'12px', paddingTop:'12px', borderTop:`1px solid rgba(224,183,101,.15)` }}>
                    <span style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.gold2, letterSpacing:'-0.02em' }}>₹{fmt(r22,0)}</span>
                    <span style={{ fontFamily:SANS, fontSize:'14px', color:`rgba(241,215,141,.5)` }}>/g · 22K</span>
                    <span onClick={() => setShowGstTip(v=>!v)} style={{ fontSize:'13px', color:C.gold, cursor:'pointer', userSelect:'none', marginLeft:'2px' }}>ⓘ</span>
                  </div>
                  {showGstTip && (
                    <div style={{ marginTop:'10px', padding:'10px 14px', background:`rgba(224,183,101,.1)`, borderRadius:'4px', fontSize:'13px', color:C.gold3, lineHeight:1.55 }}>
                      GST-inclusive rate shown. If you're GST-registered, we pass the tax credit back to you.
                    </div>
                  )}
                </>
            }
          </div>
          <div style={{ fontFamily:SERIF, fontSize:'12px', color:`rgba(241,215,141,.4)`, marginTop:'14px', fontStyle:'italic' }}>
            {spot.error && !spot.updatedAt ? 'Live rate temporarily unavailable' : time ? `Live rate · Updated ${time}` : 'Fetching live rate…'}
          </div>
        </Card>

        <div onClick={() => navigate('/sell')} style={{ background:C.ink, borderRadius:'8px', padding:'24px', border:`1px solid rgba(224,183,101,.12)`, cursor:'pointer', marginBottom:'12px', boxShadow:'0 6px 24px rgba(22,18,31,.18)', position:'relative', overflow:'hidden', transition:'transform .2s,box-shadow .2s' }}>
          <div style={{ position:'absolute', top:'-50px', right:'-50px', width:'180px', height:'180px', borderRadius:'50%', background:`radial-gradient(circle,rgba(224,183,101,.18) 0%,transparent 70%)`, pointerEvents:'none' }}/>
          <Eyebrow light>Sell Gold</Eyebrow>
          <div style={{ fontFamily:SERIF, fontSize:'26px', fontWeight:350, color:C.white, letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:'8px' }}>Sell to Carat Money</div>
          <div style={{ fontSize:'15px', color:`rgba(255,255,255,.55)`, lineHeight:1.55, marginBottom:'20px' }}>Get an instant WhatsApp quote. We come to you.</div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:C.green, color:C.white, padding:'10px 20px', borderRadius:'999px', fontSize:'14px', fontWeight:600, fontFamily:SANS }}>
            <MessageCircle size={15}/> Get a quote
          </div>
        </div>

        <div onClick={() => navigate('/margin')} style={{ background:C.white, borderRadius:'8px', padding:'24px', border:`1px solid rgba(26,20,38,.1)`, cursor:'pointer', marginBottom:'20px', boxShadow:'0 2px 12px rgba(22,18,31,.06)', transition:'transform .2s,box-shadow .2s' }}>
          <Eyebrow>Check Margin</Eyebrow>
          <div style={{ fontFamily:SERIF, fontSize:'26px', fontWeight:350, color:C.ink, letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:'8px' }}>Check your buyer's margin</div>
          <div style={{ fontSize:'15px', color:C.mute, lineHeight:1.55, marginBottom:'20px' }}>See exactly what your buyer is keeping above today's rate.</div>
          <BtnPrimary style={{ width:'auto', padding:'10px 20px' }}>
            <TrendingDown size={15}/> Calculate margin
          </BtnPrimary>
        </div>

        <div style={{ padding:'16px 0', marginBottom:'16px', borderTop:`1px solid rgba(26,20,38,.12)`, borderBottom:`1px solid rgba(26,20,38,.12)`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
          <span style={{ fontSize:'14px', color:C.mute, fontFamily:SANS }}>Looking to buy gold?</span>
          <span onClick={() => navigate('/buy')} style={{ fontSize:'14px', fontWeight:600, color:C.gold, fontFamily:SANS, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px' }}>
            Buy 24K BIS-hallmarked coins →
          </span>
        </div>

        <div style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, textAlign:'center', lineHeight:1.8, letterSpacing:'0.06em', textTransform:'uppercase' }}>
          Fair · Transparent · Dependable
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
  const setMobileG  = v => setMobile(v.replace(/\D/g,'').slice(0,10));
  const mobileValid = mobile.length === 10 && /^[6-9]/.test(mobile);
  const canSubmit   = mobileValid && name.trim().length >= 2 && parseNum(weight) > 0;
  const onSubmit = () => {
    if (!canSubmit) return;
    const lines = ["Hi Carat Money — I'd like to sell my gold.",'',`Name: ${name.trim()}`,`Phone: +91${mobile}`,`Approx. weight: ${weight}g`];
    if (city.trim()) lines.push(`City: ${city.trim()}`);
    lines.push('','Please send me a quote.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`,'_blank');
  };
  return (
    <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink }}>
      <RateStrip spot={spot}/>
      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 18px 48px' }}>
        <BackBtn navigate={navigate}/>
        <div style={{ textAlign:'center', padding:'12px 0 24px' }}>
          <h1 style={{ fontFamily:SERIF, fontSize:'32px', fontWeight:350, lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 8px', color:C.ink }}>
            Sell your gold to <span style={{ fontStyle:'italic', color:C.plum }}>Carat Money</span>
          </h1>
          <p style={{ fontSize:'15px', color:C.mute, lineHeight:1.55, margin:0 }}>Share your details and we'll reach out on WhatsApp.</p>
        </div>
        <Card style={{ marginBottom:'14px' }}>
          <Eyebrow>Your Details</Eyebrow>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Full name</label>
            <input type="text" placeholder="e.g. Priya S" value={name} onChange={e=>setName(e.target.value)} style={INP}/>
          </div>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Mobile number</label>
            <div style={{ display:'flex', alignItems:'center', background:C.white, borderRadius:'4px', border:`1.5px solid rgba(26,20,38,.18)`, overflow:'hidden' }}>
              <span style={{ padding:'13px 12px 13px 14px', fontSize:'16px', color:C.mute, fontWeight:500, borderRight:`1px solid rgba(26,20,38,.12)`, flexShrink:0, fontFamily:SANS }}>+91</span>
              <input type="tel" inputMode="numeric" placeholder="10-digit number" value={mobile} onChange={e=>setMobileG(e.target.value)} style={{ ...INP, border:'none', borderRadius:0, flex:1, minWidth:0 }}/>
            </div>
          </div>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Approx. gross weight</label>
            <div style={{ position:'relative' }}>
              <input type="number" inputMode="decimal" placeholder="e.g. 25" value={weight} onChange={e=>setWeight(e.target.value)} style={{ ...INP, paddingRight:'58px' }}/>
              <span style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', color:C.mute, fontSize:'13px', fontWeight:500, pointerEvents:'none', fontFamily:MONO }}>grams</span>
            </div>
          </div>
          <div>
            <label style={LBL}>City <span style={{ color:C.mute, fontWeight:400, fontSize:'13px' }}>(optional)</span></label>
            <input type="text" placeholder="e.g. Bangalore" value={city} onChange={e=>setCity(e.target.value)} style={INP}/>
          </div>
        </Card>
        <Card dark style={{ marginBottom:'14px' }}>
          <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.gold3, letterSpacing:'-0.02em', marginBottom:'18px' }}>Get your WhatsApp quote</div>
          <BtnWhatsApp onClick={onSubmit} disabled={!canSubmit}>
            <MessageCircle size={18}/> Send details on WhatsApp
          </BtnWhatsApp>
          <div style={{ fontSize:'12px', color:`rgba(241,215,141,.4)`, marginTop:'12px', textAlign:'center', lineHeight:1.5, fontFamily:MONO, letterSpacing:'0.04em' }}>
            By submitting, you agree to be contacted about your gold sale.
          </div>
        </Card>
        <div style={{ fontFamily:SERIF, fontSize:'13px', color:C.mute, textAlign:'center', lineHeight:1.7, fontStyle:'italic' }}>
          We'll reach out within a few hours to schedule a visit.
        </div>
      </div>
    </div>
  );
}

// ─── Open Box Modal ───────────────────────────────────────────────────────────
function OpenBoxModal({ onClose }) {
  const Step = ({ icon, title, desc }) => (
    <div style={{ display:'flex', gap:'14px', alignItems:'flex-start', marginBottom:'22px' }}>
      <div style={{ width:'48px', height:'48px', borderRadius:'6px', background:C.paper2, border:`1px solid rgba(184,136,58,.2)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:C.gold }}>{icon}</div>
      <div>
        <div style={{ fontFamily:SANS, fontSize:'16px', fontWeight:600, color:C.ink, marginBottom:'4px' }}>{title}</div>
        <div style={{ fontSize:'14px', color:C.mute, lineHeight:1.55 }}>{desc}</div>
      </div>
    </div>
  );
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(22,18,31,.6)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', display:'flex', alignItems:'flex-end', justifyContent:'center', animation:'fadeIn .25s ease' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.paper, borderRadius:'10px 10px 0 0', width:'100%', maxWidth:'520px', maxHeight:'92vh', overflowY:'auto', padding:'28px 24px 32px', animation:'slideUp .3s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', gap:'12px' }}>
          <h2 style={{ fontFamily:SERIF, fontSize:'26px', fontWeight:350, margin:0, lineHeight:1.15, color:C.ink, letterSpacing:'-0.02em' }}>How Open Box Delivery Works</h2>
          <button onClick={onClose} style={{ background:C.paper2, border:'none', borderRadius:'50%', width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:C.mute, flexShrink:0 }}><X size={16}/></button>
        </div>
        <p style={{ fontSize:'14px', color:C.mute, lineHeight:1.55, marginTop:0, marginBottom:'26px' }}>
          We'll open the package at your doorstep so you can check the product before accepting it.
        </p>
        <Step icon={<KeyRound size={22} strokeWidth={2}/>}    title="Share OTP to start"     desc="Give the start OTP to the delivery partner to begin verification."/>
        <Step icon={<Search size={22} strokeWidth={2}/>}      title="Check the product"      desc="Make sure the product and packaging look right and in good condition."/>
        <Step icon={<ShieldCheck size={22} strokeWidth={2}/>} title="Confirm with final OTP" desc="Share the final OTP only if everything's fine. If not, hand it back to the delivery partner."/>
        <div style={{ padding:'14px 16px', background:`rgba(184,136,58,.1)`, borderRadius:'6px', display:'flex', gap:'10px', alignItems:'flex-start', border:`1px solid rgba(184,136,58,.2)` }}>
          <AlertCircle size={18} color={C.gold} style={{ flexShrink:0, marginTop:'2px' }}/>
          <div style={{ fontSize:'13px', color:C.ink2, lineHeight:1.5, fontWeight:500 }}>
            Open box delivery orders are checked during delivery, so once they are accepted, they can't be returned.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Buy Page ─────────────────────────────────────────────────────────────────
function BuyPage({ navigate }) {
  const [qty, setQty]                 = useState({'0.1':0,'0.5':0,'1':0});
  const [name, setName]               = useState('');
  const [mobile, setMobile]           = useState('');
  const [pincode, setPincode]         = useState('');
  const [address, setAddress]         = useState('');
  const [showOpenBox, setShowOpenBox] = useState(false);

  const prices = { '0.1':Math.round(BUY_RATE_24K*0.1), '0.5':Math.round(BUY_RATE_24K*0.5), '1':Math.round(BUY_RATE_24K) };
  const totalCoins  = qty['0.1']+qty['0.5']+qty['1'];
  const totalAmount = qty['0.1']*prices['0.1']+qty['0.5']*prices['0.5']+qty['1']*prices['1'];
  const setQ        = (size, delta) => setQty(prev => ({...prev,[size]:Math.max(0,Math.min(99,prev[size]+delta))}));
  const setMobileG  = v => setMobile(v.replace(/\D/g,'').slice(0,10));
  const setPincodeG = v => setPincode(v.replace(/\D/g,'').slice(0,6));
  const mobileValid = mobile.length===10 && /^[6-9]/.test(mobile);
  const canSubmit   = mobileValid && pincode.length===6 && name.trim().length>=2 && address.trim().length>=8 && totalCoins>0;

  const onSubmit = () => {
    if (!canSubmit) return;
    const lines = ['Hi Carat Money — I want to buy gold coins.',''];
    if (qty['1']>0)   lines.push(`${qty['1']} × 1g coin · ₹${fmt(qty['1']*prices['1'],0)}`);
    if (qty['0.5']>0) lines.push(`${qty['0.5']} × 0.5g coin · ₹${fmt(qty['0.5']*prices['0.5'],0)}`);
    if (qty['0.1']>0) lines.push(`${qty['0.1']} × 0.1g coin · ₹${fmt(qty['0.1']*prices['0.1'],0)}`);
    lines.push('',`Total: ₹${fmt(totalAmount,0)} (${totalCoins} coins)`,'');
    lines.push(`Name: ${name.trim()}`,`Phone: +91${mobile}`,`Pincode: ${pincode}`,`Address: ${address.trim()}`,'','Please confirm availability and delivery.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`,'_blank');
  };

  const StepperRow = ({ size, label }) => {
    const count = qty[size], sub = count*prices[size];
    return (
      <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 0', borderTop:`1px solid rgba(26,20,38,.08)` }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:'16px', fontWeight:600, color:C.ink, marginBottom:'2px' }}>{label}</div>
          <div style={{ fontFamily:MONO, fontSize:'12px', color:C.mute }}>₹{fmt(prices[size],0)} each · incl. GST</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
          <button onClick={()=>setQ(size,-1)} disabled={count===0} style={{ width:'36px', height:'36px', borderRadius:'4px', background:count===0?C.paper2:C.paper, border:`1.5px solid rgba(26,20,38,.15)`, color:count===0?C.mute:C.plum, display:'flex', alignItems:'center', justifyContent:'center', cursor:count===0?'not-allowed':'pointer', opacity:count===0?.4:1 }}>
            <Minus size={16} strokeWidth={2.5}/>
          </button>
          <span style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.ink, minWidth:'24px', textAlign:'center' }}>{count}</span>
          <button onClick={()=>setQ(size,+1)} style={{ width:'36px', height:'36px', borderRadius:'4px', background:C.paper, border:`1.5px solid rgba(26,20,38,.15)`, color:C.plum, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Plus size={16} strokeWidth={2.5}/>
          </button>
        </div>
        <div style={{ fontFamily:SERIF, fontSize:'16px', fontWeight:350, color:sub>0?C.ink:C.paper2, minWidth:'80px', textAlign:'right' }}>
          {sub>0?`₹${fmt(sub,0)}`:'—'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink }}>
      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 18px 48px' }}>
        <BackBtn navigate={navigate}/>
        <div style={{ textAlign:'center', padding:'12px 0 24px' }}>
          <h1 style={{ fontFamily:SERIF, fontSize:'32px', fontWeight:350, lineHeight:1.1, letterSpacing:'-0.02em', margin:'0 0 8px' }}>
            Buy <span style={{ fontStyle:'italic', color:C.plum }}>24K</span> gold coins
          </h1>
          <p style={{ fontSize:'15px', color:C.mute, lineHeight:1.55, margin:0 }}>BIS-hallmarked · 999.9 purity · 48-hr open-box return</p>
        </div>
        <Card style={{ marginBottom:'14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'6px' }}>
            <Eyebrow>Today's Coin Prices</Eyebrow>
            <div style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, letterSpacing:'0.06em' }}>Updated {BUY_RATE_DATE}</div>
          </div>
          <StepperRow size="0.1" label="0.1g coin"/>
          <StepperRow size="0.5" label="0.5g coin"/>
          <StepperRow size="1"   label="1g coin"/>
          {totalCoins>0 ? (
            <div style={{ marginTop:'16px', padding:'16px', background:C.plum, borderRadius:'6px', border:`1px solid rgba(224,183,101,.2)` }}>
              <Eyebrow light>Order Total</Eyebrow>
              <div style={{ display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'8px' }}>
                <span style={{ fontFamily:SERIF, fontSize:'32px', fontWeight:350, color:C.gold3, letterSpacing:'-0.02em', lineHeight:1 }}>₹{fmt(totalAmount,0)}</span>
                <span style={{ fontFamily:MONO, fontSize:'12px', color:`rgba(241,215,141,.5)` }}>· {totalCoins} {totalCoins===1?'coin':'coins'}</span>
              </div>
              <div style={{ fontFamily:SANS, fontSize:'13px', color:`rgba(241,215,141,.6)`, lineHeight:1.7 }}>
                {qty['1']>0&&<>{qty['1']} × 1g (₹{fmt(qty['1']*prices['1'],0)})</>}
                {qty['1']>0&&(qty['0.5']>0||qty['0.1']>0)&&' + '}
                {qty['0.5']>0&&<>{qty['0.5']} × 0.5g (₹{fmt(qty['0.5']*prices['0.5'],0)})</>}
                {qty['0.5']>0&&qty['0.1']>0&&' + '}
                {qty['0.1']>0&&<>{qty['0.1']} × 0.1g (₹{fmt(qty['0.1']*prices['0.1'],0)})</>}
              </div>
            </div>
          ) : (
            <div style={{ marginTop:'16px', padding:'14px', background:C.paper2, borderRadius:'6px', fontFamily:MONO, fontSize:'12px', color:C.mute, textAlign:'center', letterSpacing:'0.06em' }}>
              Tap + to add coins to your order
            </div>
          )}
          <div style={{ marginTop:'14px', padding:'14px', background:`rgba(184,136,58,.08)`, borderRadius:'6px', fontFamily:SANS, fontSize:'13px', color:C.mute, lineHeight:1.6, textAlign:'center', border:`1px solid rgba(184,136,58,.15)` }}>
            Need a custom coin?{' '}
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Carat Money — I'm interested in a custom gold coin.")}`} target="_blank" rel="noreferrer" style={{ color:C.gold, fontWeight:600, textDecoration:'none' }}>WhatsApp us</a>
            {' '}to discuss specific weights or designs.
          </div>
        </Card>
        <Card style={{ marginBottom:'14px' }}>
          <Eyebrow>Delivery Details</Eyebrow>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Full name</label>
            <input type="text" placeholder="e.g. Priya S" value={name} onChange={e=>setName(e.target.value)} style={INP}/>
          </div>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Mobile number</label>
            <div style={{ display:'flex', alignItems:'center', background:C.white, borderRadius:'4px', border:`1.5px solid rgba(26,20,38,.18)`, overflow:'hidden' }}>
              <span style={{ padding:'13px 12px 13px 14px', fontSize:'16px', color:C.mute, fontWeight:500, borderRight:`1px solid rgba(26,20,38,.12)`, flexShrink:0, fontFamily:SANS }}>+91</span>
              <input type="tel" inputMode="numeric" placeholder="10-digit number" value={mobile} onChange={e=>setMobileG(e.target.value)} style={{ ...INP, border:'none', borderRadius:0, flex:1, minWidth:0 }}/>
            </div>
          </div>
          <div style={{ marginBottom:'18px' }}>
            <label style={LBL}>Pincode</label>
            <input type="tel" inputMode="numeric" placeholder="6-digit pincode" value={pincode} onChange={e=>setPincodeG(e.target.value)} style={INP}/>
          </div>
          <div>
            <label style={LBL}>Delivery address</label>
            <textarea placeholder="House / Flat no, street, area, city" value={address} onChange={e=>setAddress(e.target.value)} rows={3} style={{ ...INP, resize:'vertical', minHeight:'90px', fontFamily:SANS }}/>
          </div>
        </Card>
        <Card dark style={{ marginBottom:'14px' }}>
          <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.gold3, letterSpacing:'-0.02em', marginBottom:'18px' }}>Place your order</div>
          <BtnWhatsApp onClick={onSubmit} disabled={!canSubmit}>
            <MessageCircle size={18}/> Send order on WhatsApp
          </BtnWhatsApp>
          <div style={{ fontSize:'12px', color:`rgba(241,215,141,.4)`, marginTop:'12px', textAlign:'center', lineHeight:1.5, fontFamily:MONO, letterSpacing:'0.04em' }}>
            We'll confirm availability and arrange delivery.
          </div>
        </Card>
        <Card style={{ marginBottom:'14px' }}>
          <Eyebrow>Why Carat Money</Eyebrow>
          {[
            { icon:<Shield size={16} strokeWidth={2}/>, text:'BIS-hallmarked, 999.9 purity', tip:false },
            { icon:<Check size={16} strokeWidth={2}/>,  text:'48-hour open-box delivery',    tip:true  },
            { icon:<Check size={16} strokeWidth={2}/>,  text:'Assay certificate included',   tip:false },
          ].map((item,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderTop:i===0?'none':`1px solid rgba(26,20,38,.08)` }}>
              <span style={{ color:C.gold, flexShrink:0, display:'inline-flex' }}>{item.icon}</span>
              <span style={{ fontSize:'15px', color:C.ink, flex:1 }}>{item.text}</span>
              {item.tip && <span onClick={()=>setShowOpenBox(true)} style={{ fontFamily:MONO, fontSize:'12px', color:C.gold, cursor:'pointer', userSelect:'none' }}>ⓘ</span>}
            </div>
          ))}
        </Card>
        <div style={{ fontFamily:MONO, fontSize:'11px', color:C.mute, textAlign:'center', lineHeight:1.8, letterSpacing:'0.06em' }}>
          Coin prices include 3% GST · Free doorstep delivery within Bangalore
        </div>
      </div>
      {showOpenBox && <OpenBoxModal onClose={()=>setShowOpenBox(false)}/>}
    </div>
  );
}

// ─── Share Section ────────────────────────────────────────────────────────────
function ShareSection() {
  const [copied, setCopied] = useState(false);
  const url  = typeof window!=='undefined' ? `${window.location.origin}/margin` : '';
  const text = `Found this free tool that shows you what gold buyers keep as margin above the spot rate. Saved me from a bad deal — try it before you sell:\n${url}`;
  const onWA   = () => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank');
  const onCopy = async () => { const ok=await copyToClipboard(url); if(ok){setCopied(true);setTimeout(()=>setCopied(false),2000);} };
  return (
    <div style={{ background:C.plum, borderRadius:'8px', padding:'24px', border:`1px solid rgba(224,183,101,.2)`, marginBottom:'14px', textAlign:'center', animation:'fadeSlide .5s ease-out' }}>
      <div style={{ fontFamily:SERIF, fontSize:'22px', fontWeight:350, color:C.gold3, marginBottom:'6px', letterSpacing:'-0.02em' }}>Found this useful?</div>
      <div style={{ fontSize:'14px', color:`rgba(241,215,141,.6)`, marginBottom:'20px', lineHeight:1.55 }}>Share with friends or family who might be selling gold soon.</div>
      <div style={{ display:'flex', gap:'10px' }}>
        <button onClick={onWA} style={{ flex:1, padding:'13px', background:C.green, color:C.white, border:'none', borderRadius:'999px', fontSize:'14px', fontWeight:600, fontFamily:SANS, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px', cursor:'pointer', boxShadow:'0 4px 14px rgba(37,211,102,.3)' }}>
          <MessageCircle size={15}/> WhatsApp
        </button>
        <button onClick={onCopy} style={{ flex:1, padding:'13px', background:'transparent', color:C.gold2, border:`1px solid rgba(224,183,101,.4)`, borderRadius:'4px', fontSize:'14px', fontWeight:600, fontFamily:SANS, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px', cursor:'pointer' }}>
          {copied?<><Check size={15}/>Copied</>:<><Copy size={15}/>Copy link</>}
        </button>
      </div>
    </div>
  );
}

// ─── Floating Share Button ────────────────────────────────────────────────────
function FloatingShareButton({ highlighted }) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const [pulsed, setPulsed] = useState(false);

  useEffect(() => {
    if (highlighted && !pulsed) setPulsed(true);
  }, [highlighted]);

  const url  = typeof window!=='undefined' ? `${window.location.origin}/margin` : '';
  const text = `Found this free tool that shows you what gold buyers keep as margin above the spot rate. Saved me from a bad deal — try it before you sell:\n${url}`;
  const onWA   = () => { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank'); setOpen(false); };
  const onCopy = async () => { const ok=await copyToClipboard(url); if(ok){setCopied(true);setTimeout(()=>{setCopied(false);setOpen(false);},1500);} };

  const btnStyle = highlighted ? {
    background: C.gold2, color: C.plum,
    border: `1px solid ${C.gold}`,
    animation: pulsed ? 'glowPulse 0.6s ease-out 1' : 'none',
    boxShadow: '0 6px 20px rgba(224,183,101,.35)',
  } : {
    background: `rgba(43,20,80,.7)`, color: `rgba(241,215,141,.5)`,
    border: `1px solid rgba(224,183,101,.15)`,
    boxShadow: '0 4px 14px rgba(43,20,80,.2)',
  };

  return (
    <>
      {open && <div onClick={()=>setOpen(false)} style={{ position:'fixed', inset:0, zIndex:90, background:'rgba(22,18,31,.3)', animation:'fadeIn .2s ease' }}/>}
      <div style={{ position:'fixed', bottom:'20px', left:'20px', zIndex:100, display:'flex', flexDirection:'column-reverse', gap:'10px', alignItems:'flex-start' }}>
        <button onClick={()=>setOpen(v=>!v)} style={{ padding:'12px 18px', borderRadius:'4px', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:MONO, fontSize:'12px', fontWeight:500, letterSpacing:'0.08em', transition:'background .4s, color .4s, box-shadow .4s', ...btnStyle }}>
          <Share2 size={14} strokeWidth={2}/>
          {highlighted ? 'SHARE THIS RESULT' : 'SHARE TOOL'}
        </button>
        {open && <>
          <button onClick={onWA} style={{ background:C.green, color:C.white, padding:'11px 16px', borderRadius:'999px', border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'7px', fontFamily:SANS, fontSize:'13px', fontWeight:600, boxShadow:'0 4px 14px rgba(37,211,102,.3)', animation:'fadeSlide .25s ease-out' }}>
            <MessageCircle size={14}/> WhatsApp
          </button>
          <button onClick={onCopy} style={{ background:C.plum, color:C.gold2, padding:'11px 16px', borderRadius:'4px', border:`1px solid rgba(224,183,101,.3)`, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'7px', fontFamily:MONO, fontSize:'12px', fontWeight:500, animation:'fadeSlide .25s ease-out' }}>
            {copied?<><Check size={14}/>COPIED</>:<><Copy size={14}/>COPY LINK</>}
          </button>
        </>}
      </div>
    </>
  );
}

// ─── Margin Page ──────────────────────────────────────────────────────────────
function MarginPage({ navigate, spot }) {
  const calcRate = spot.raw ?? SPOT_FALLBACK;

  // ── State ─────────────────────────────────────────────────────────────────
  const [ornaments,     setOrnaments]     = useState(()=>[blankOrnament()]);
  const [serviceFee,    setServiceFee]    = useState('');
  const [revisedTotal,  setRevisedTotal]  = useState('');
  const [mobile,        setMobile]        = useState('');
  const [collapsed,     setCollapsed]     = useState(new Set());
  const [showBreakdown, setShowBreakdown] = useState(false);

  const isMulti = ornaments.length > 1;
  const feeN    = parseNum(serviceFee) ?? 0;
  const revN    = parseNum(revisedTotal);

  // ── Ornament data ─────────────────────────────────────────────────────────
  const ornamentData = useMemo(() => ornaments.map(o => {
    const g=parseNum(o.gross), s=parseNum(o.stone)??0, w=parseNum(o.wastage)??0, p=parseNum(o.purity), ppg=parseNum(o.pricePerGram);
    const netWeight=g!==null?g-s-w:null, netError=g!==null&&netWeight!==null&&netWeight<=0;
    const isValid=netWeight!==null&&netWeight>0&&p!==null&&p>0&&p<=100&&ppg!==null&&ppg>0;
    let purchaseContrib=null,salesContrib=null,effRate=null;
    if(isValid){const purity=p/100,recoverable=netWeight+STONE_RECOVERY*s+WASTAGE_RECOVERY*w;purchaseContrib=netWeight*ppg;salesContrib=recoverable*purity*calcRate;effRate=ppg/purity;}
    return {id:o.id,gross:g,stone:s,wastage:w,purity:p,ppg,netWeight,netError,isValid,purchaseContrib,salesContrib,effRate};
  }), [ornaments, calcRate]);

  // ── margin1 must be declared before the shareHighlighted useEffect ────────
  const margin1 = useMemo(() => {
    const valid=ornamentData.filter(d=>d.isValid); if(!valid.length)return null;
    const fee=feeN/100,sumPR=valid.reduce((a,d)=>a+d.purchaseContrib,0),sumS=valid.reduce((a,d)=>a+d.salesContrib,0),sumNP=valid.reduce((a,d)=>a+d.netWeight*(d.purity/100),0),pt=sumPR*(1-fee);
    return {value:(1-pt/sumS)*100,eff:pt/sumNP,total:pt,purchase_total:pt,sales_total:sumS,ornamentCount:valid.length,totalNetWeight:valid.reduce((a,d)=>a+d.netWeight,0)};
  }, [ornamentData, feeN]);

  // ── Share highlight — depends on margin1, so declared after it ───────────
  const [shareHighlighted, setShareHighlighted] = useState(false);
  const marginCardRef = useRef(null);
  useEffect(() => {
    if (!marginCardRef.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio > 0.5 && margin1 !== null) setShareHighlighted(true);
    }, { threshold: [0, 0.5] });
    io.observe(marginCardRef.current);
    return () => io.disconnect();
  }, [margin1]);

  // ── margin2 ───────────────────────────────────────────────────────────────
  const margin2 = useMemo(() => {
    if(revN===null||revN<=0)return null;
    const valid=ornamentData.filter(d=>d.isValid); if(!valid.length)return null;
    const sumS=valid.reduce((a,d)=>a+d.salesContrib,0),sumNP=valid.reduce((a,d)=>a+d.netWeight*(d.purity/100),0);
    return {value:(1-revN/sumS)*100,eff:revN/sumNP,total:revN,purchase_total:revN,sales_total:sumS};
  }, [revN, ornamentData]);

  const lotSummary = useMemo(() => {
    const w=ornamentData.filter(d=>d.netWeight!==null&&d.netWeight>0); if(!w.length)return null;
    return {ornamentCount:ornaments.length,totalGross:w.reduce((a,d)=>a+d.gross,0),totalNet:w.reduce((a,d)=>a+d.netWeight,0)};
  }, [ornamentData, ornaments.length]);

  const showLotSticky = isMulti && lotSummary !== null && margin1 === null;
  const stickyVisible = margin1 !== null || showLotSticky;

  const [activeSection, setActiveSection] = useState('first');
  const revisedObserverRef = useRef(null);
  const attachRevisedObserver = useCallback(node => {
    if(revisedObserverRef.current){revisedObserverRef.current.disconnect();revisedObserverRef.current=null;}
    if(!node)return;
    const io=new IntersectionObserver(([e])=>setActiveSection(e.intersectionRatio>0.35?'revised':'first'),{threshold:[0,.35,.6]});
    io.observe(node); revisedObserverRef.current=io;
  }, []);
  useEffect(() => ()=>revisedObserverRef.current?.disconnect(), []);

  const anyNetError = ornamentData.some(d=>d.netError);
  const progressText = (() => {
    if(anyNetError) return "Stone + wastage can't exceed gross.";
    if(margin1!==null) return null;
    if(!isMulti){const d=ornamentData[0],missing=3-[d.gross,d.purity,d.ppg].filter(v=>v!==null&&v>0).length;
      if(missing===3)return"Fill in what your buyer told you.";if(missing===2)return"Keep going — 2 more fields.";if(missing===1)return"Almost there. One last field.";}
    return "Complete at least one ornament to see the margin.";
  })();
  const filled = !isMulti ? [ornamentData[0].gross,ornamentData[0].purity,ornamentData[0].ppg].filter(v=>v!==null&&v>0).length : 0;

  const tone = v => {
    if(v==null) return{fg:C.mute,bg:C.paper2,label:''};
    if(v<0)  return{fg:'#991B1B',bg:'#FEE2E2',label:'Above spot — verify this'};
    if(v<6)  return{fg:'#15803D',bg:'#DCFCE7',label:'Fair margin'};
    if(v<10) return{fg:'#B45309',bg:'#FEF3C7',label:'On the higher side'};
    if(v<15) return{fg:'#B91C1C',bg:'#FEE2E2',label:'High — push back'};
    return       {fg:'#991B1B',bg:'#FEE2E2',label:'Very high — push back hard'};
  };

  const updateOrnament = (id,field,value) => setOrnaments(prev=>prev.map(o=>o.id===id?{...o,[field]:value}:o));
  const addOrnament = () => {
    if(ornaments.length>=MAX_ORNAMENTS)return;
    const vids=ornamentData.filter(d=>d.isValid).map(d=>d.id);
    setCollapsed(prev=>new Set([...prev,...vids]));
    setOrnaments(prev=>[...prev,blankOrnament()]);
  };
  const removeOrnament = id => {
    if(ornaments.length<=1)return;
    setOrnaments(prev=>prev.filter(o=>o.id!==id));
    setCollapsed(prev=>{const n=new Set(prev);n.delete(id);return n;});
  };
  const toggleCollapse = id => setCollapsed(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});
  const setWeightF = (id,field,v) => {if(v==='')return updateOrnament(id,field,'');const n=parseFloat(v);if(isNaN(n)||n<0)return;updateOrnament(id,field,v);};
  const setPurityF = (id,v) => {if(v==='')return updateOrnament(id,'purity','');const n=parseFloat(v);if(isNaN(n)||n<0||n>100)return;updateOrnament(id,'purity',v);};
  const setPriceF  = (id,v) => {if(v==='')return updateOrnament(id,'pricePerGram','');const[i]=String(v).split('.');if(i.replace('-','').length>5)return;const n=parseFloat(v);if(isNaN(n)||n<0)return;updateOrnament(id,'pricePerGram',v);};
  const setFeeG    = v => {if(v==='')return setServiceFee('');const n=parseFloat(v);if(isNaN(n)||n<0||n>10)return;setServiceFee(v);};
  const setRevG    = v => {if(v==='')return setRevisedTotal('');const n=parseFloat(v);if(isNaN(n)||n<0)return;setRevisedTotal(v);};
  const setMobileG  = v => setMobile(v.replace(/\D/g,'').slice(0,10));
  const mobileValid = mobile.length===10 && /^[6-9]/.test(mobile);

  const onCTA = () => {
    if(!mobileValid)return;
    const body=['Hi Carat Money — I used the margin checker.',''];
    if(isMulti&&margin1){body.push(`Lot: ${margin1.ornamentCount} ornaments · ${fmt(margin1.totalNetWeight)}g net`);ornamentData.filter(d=>d.isValid).forEach((d,i)=>body.push(`  ${i+1}. ${fmt(d.netWeight)}g net · ${d.purity}% · ₹${fmt(d.ppg,0)}/g`));}
    else{const d=ornamentData[0];body.push(`Gross: ${d.gross??'—'}g · Stone: ${d.stone}g · Wastage: ${d.wastage}g`,`Net: ${d.netWeight?fmt(d.netWeight):'—'}g @ ${d.purity??'—'}% purity`,`Buyer's offer: ₹${d.ppg?fmt(d.ppg,0):'—'}/g`);}
    body.push(`Service fee: ${feeN}%`);
    if(margin1)body.push(`Buyer quote: ${margin1.value.toFixed(1)}% margin · ₹${fmt(margin1.total,0)}`);
    if(revN)body.push(`Revised offer: ₹${fmt(revN,0)} total`);
    if(margin2)body.push(`Revised margin: ${margin2.value.toFixed(1)}%`);
    body.push('',`My number: +91${mobile}`,'Would like a better quote, please.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body.join('\n'))}`,'_blank');
  };

  const t1 = tone(margin1?.value);
  const t2 = tone(margin2?.value);
  const collapsedSummary = d => !d.isValid ? 'Incomplete' : `${fmt(d.netWeight)}g · ${d.purity}% · ₹${fmt(d.ppg,0)}/g`;

  const fldRow  = { marginBottom:'18px' };
  const labRow  = { display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'7px', gap:'8px' };
  const lab     = { fontSize:'14px', fontWeight:600, color:C.ink2, fontFamily:SANS };
  const unt     = { fontFamily:MONO, fontSize:'11px', color:C.mute, letterSpacing:'0.04em', textAlign:'right' };
  const rdOnly  = { background:C.paper2, color:C.ink, fontWeight:600, border:`1.5px dashed rgba(26,20,38,.2)`, fontSize:'16px', padding:'13px 14px', borderRadius:'4px', minHeight:'48px', display:'flex', alignItems:'center', boxSizing:'border-box' };
  const errStyle= { borderColor:'#DC2626', color:'#DC2626' };
  const errTxt  = { fontSize:'13px', color:'#DC2626', marginTop:'6px', fontWeight:500 };
  const pfxWrap = { position:'relative' };
  const pfx     = { position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:C.mute, fontWeight:500, pointerEvents:'none', fontFamily:SANS };

  return (
    <div style={{ minHeight:'100dvh', background:C.paper, fontFamily:SANS, color:C.ink, paddingTop:stickyVisible?'52px':0, transition:'padding-top .3s ease' }}>

      {/* Sticky bar */}
      {stickyVisible && (
        <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:`rgba(43,20,80,.96)`, backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', borderBottom:`1px solid rgba(224,183,101,.15)`, boxShadow:'0 2px 16px rgba(43,20,80,.2)', animation:'stickyDrop .35s ease' }}>
          <div style={{ maxWidth:'520px', margin:'0 auto', padding:'12px 18px', display:'flex', alignItems:'center', gap:'10px', borderLeft:`3px solid ${C.gold}`, minHeight:'52px', boxSizing:'border-box' }}>
            {margin1===null ? (
              <div key="lot" style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', animation:'stickySwap .25s ease' }}>
                <span style={{ fontFamily:MONO, fontSize:'9px', fontWeight:500, letterSpacing:'0.14em', color:C.gold2, flexShrink:0 }}>{lotSummary.ornamentCount} ORNAMENTS</span>
                <span style={{ width:'3px', height:'3px', borderRadius:'50%', background:`rgba(224,183,101,.4)`, flexShrink:0 }}/>
                <span style={{ fontFamily:SERIF, fontSize:'14px', color:C.gold3, flexShrink:0 }}>{fmt(lotSummary.totalGross)}g gross</span>
                <span style={{ fontFamily:SERIF, fontSize:'15px', fontWeight:350, color:C.gold3, marginLeft:'auto', flexShrink:0 }}>{fmt(lotSummary.totalNet)}g net</span>
              </div>
            ) : (() => {
              const showRevised=activeSection==='revised'&&margin2!==null;
              const t=showRevised?t2:t1, m=showRevised?margin2:margin1, key=showRevised?'r':'f';
              const delta=showRevised&&margin1?margin1.value-margin2.value:null;
              return (
                <div key={key} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', animation:'stickySwap .25s ease' }}>
                  <span style={{ fontFamily:MONO, fontSize:'9px', fontWeight:500, letterSpacing:'0.14em', color:C.gold2, flexShrink:0 }}>{showRevised?'REVISED':'BUYER QUOTE'}</span>
                  <span style={{ width:'3px', height:'3px', borderRadius:'50%', background:`rgba(224,183,101,.4)`, flexShrink:0 }}/>
                  <span style={{ fontFamily:SERIF, fontSize:'20px', fontWeight:350, color:t.fg, letterSpacing:'-0.02em', lineHeight:1, flexShrink:0 }}>{m.value.toFixed(1)}%</span>
                  {delta!==null && <span style={{ fontFamily:MONO, fontSize:'10px', fontWeight:500, color:C.gold3, display:'inline-flex', alignItems:'center', gap:'2px', flexShrink:0 }}><TrendingDown size={11}/>{delta>0?`${delta.toFixed(1)}pp`:'no drop'}</span>}
                  {isMulti
                    ? <span style={{ fontFamily:MONO, fontSize:'11px', color:`rgba(241,215,141,.5)`, marginLeft:'auto', flexShrink:0 }}>{margin1.ornamentCount} ornaments · {fmt(margin1.totalNetWeight)}g</span>
                    : <span style={{ fontFamily:SERIF, fontSize:'14px', fontWeight:350, color:C.gold3, marginLeft:'auto', flexShrink:0 }}>₹{fmt(m.total,0)}</span>}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'0 18px 48px' }}>
        <BackBtn navigate={navigate}/>

        <div style={{ textAlign:'center', padding:'10px 0 24px' }}>
          <h1 style={{ fontFamily:SERIF, fontSize:'34px', fontWeight:350, lineHeight:1.08, letterSpacing:'-0.02em', margin:0, color:C.ink }}>
            Check your gold buyer's <span style={{ fontStyle:'italic', color:C.plum }}>margin</span>
          </h1>
          <p style={{ fontSize:'15px', color:C.mute, marginTop:'12px', lineHeight:1.55, maxWidth:'400px', marginLeft:'auto', marginRight:'auto' }}>
            Before you sell, see exactly what they're keeping above today's spot price.
          </p>
        </div>

        {/* Input card */}
        <Card style={{ marginBottom:'14px' }}>
          <Eyebrow>{isMulti ? `Your Lot · ${ornaments.length} Ornaments` : 'What Your Buyer Told You'}</Eyebrow>
          {ornaments.map((o,idx) => {
            const d=ornamentData[idx], isCollapsed=isMulti&&collapsed.has(o.id);
            return (
              <div key={o.id} style={{ paddingTop:idx===0?0:'20px', marginTop:idx===0?0:'20px', borderTop:idx===0?'none':`1px solid rgba(26,20,38,.08)` }}>
                {isMulti && (
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:isCollapsed?0:'16px', cursor:'pointer', userSelect:'none' }} onClick={()=>toggleCollapse(o.id)}>
                    <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'22px', height:'22px', borderRadius:'50%', background:C.paper2, color:C.plum, fontFamily:SERIF, fontSize:'12px', fontWeight:350, flexShrink:0 }}>{idx+1}</div>
                    <span style={{ fontSize:'14px', fontWeight:600, color:C.ink }}>Ornament {idx+1}</span>
                    {isCollapsed && <span style={{ fontSize:'13px', color:C.mute, marginLeft:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0 }}>· {collapsedSummary(d)}</span>}
                    <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'4px', flexShrink:0 }}>
                      <button style={{ background:'transparent', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer', color:C.mute, display:'inline-flex', alignItems:'center' }} onClick={e=>{e.stopPropagation();toggleCollapse(o.id);}}>
                        {isCollapsed?<ChevronDown size={16}/>:<ChevronUp size={16}/>}
                      </button>
                      {ornaments.length>1 && <button style={{ background:'transparent', border:'none', padding:'6px', borderRadius:'4px', cursor:'pointer', color:C.mute, display:'inline-flex', alignItems:'center' }} onClick={e=>{e.stopPropagation();removeOrnament(o.id);}}><Trash2 size={15}/></button>}
                    </span>
                  </div>
                )}
                {!isCollapsed && (
                  <>
                    <div style={fldRow}>
                      <div style={labRow}><label style={lab}>Gross weight</label><span style={unt}>grams · weighing scale</span></div>
                      <input type="number" inputMode="decimal" placeholder="e.g. 10.25" value={o.gross} onChange={e=>setWeightF(o.id,'gross',e.target.value)} style={INP}/>
                    </div>
                    <div style={{ display:'flex', gap:'10px', marginBottom:'18px' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={labRow}><label style={lab}>Stone</label><span style={unt}>g</span></div>
                        <input type="number" inputMode="decimal" placeholder="0" value={o.stone} onChange={e=>setWeightF(o.id,'stone',e.target.value)} style={INP}/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={labRow}><label style={lab}>Wastage</label><span style={unt}>g</span></div>
                        <input type="number" inputMode="decimal" placeholder="0" value={o.wastage} onChange={e=>setWeightF(o.id,'wastage',e.target.value)} style={INP}/>
                      </div>
                    </div>
                    <div style={fldRow}>
                      <div style={labRow}><label style={lab}>Net weight</label><span style={unt}>auto-calculated</span></div>
                      <div style={{...rdOnly,...(d.netError?errStyle:{})}}>{d.netWeight!==null?fmt(d.netWeight):'—'}</div>
                      {d.netError && <div style={errTxt}>Net weight must be greater than zero.</div>}
                    </div>
                    <div style={fldRow}>
                      <div style={labRow}><label style={lab}>Purity</label><span style={unt}>% · 2 decimals</span></div>
                      <input type="number" inputMode="decimal" placeholder="e.g. 91.60" step="0.01" value={o.purity} onChange={e=>setPurityF(o.id,e.target.value)} style={INP}/>
                      <div style={{ fontFamily:SANS, fontSize:'13px', color:C.mute, marginTop:'7px', lineHeight:1.5, display:'flex', alignItems:'flex-start', gap:'5px' }}>
                        <Info size={13} style={{ flexShrink:0, marginTop:'1px' }}/><span>Ask the buyer to show you the exact reading on their purity machine.</span>
                      </div>
                    </div>
                    <div style={{ marginBottom:0 }}>
                      <div style={labRow}><label style={lab}>Purchase price per gram</label><span style={unt}>₹/g at stated purity</span></div>
                      <div style={pfxWrap}>
                        <span style={pfx}>₹</span>
                        <input type="number" inputMode="decimal" placeholder="e.g. 13500" value={o.pricePerGram} onChange={e=>setPriceF(o.id,e.target.value)} style={{ ...INP, paddingLeft:'30px' }}/>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {ornaments.length < MAX_ORNAMENTS && (
            <button style={{ width:'100%', marginTop:'20px', padding:'13px', background:C.paper, color:C.gold, border:`1.5px dashed rgba(184,136,58,.4)`, borderRadius:'4px', fontSize:'14px', fontWeight:600, fontFamily:SANS, cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px' }} onClick={addOrnament}>
              <Plus size={16}/>Add another ornament
            </button>
          )}
          {ornaments.length >= MAX_ORNAMENTS && (
            <div style={{ marginTop:'14px', padding:'12px 14px', background:C.paper2, borderRadius:'4px', fontFamily:MONO, fontSize:'11px', color:C.mute, textAlign:'center', lineHeight:1.55, letterSpacing:'0.04em' }}>
              Max {MAX_ORNAMENTS} ornaments. For larger lots, <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" style={{ color:C.gold, fontWeight:500 }}>WhatsApp us</a>.
            </div>
          )}

          <div style={{ marginTop:'22px', paddingTop:'20px', borderTop:`1px solid rgba(26,20,38,.08)` }}>
            <div style={labRow}><label style={lab}>Service fee</label><span style={unt}>% · max 10%</span></div>
            <input type="number" inputMode="decimal" placeholder="e.g. 3" step="0.1" max="10" value={serviceFee} onChange={e=>setFeeG(e.target.value)} style={INP}/>
          </div>
        </Card>

        {/* Margin reveal card — ref attached here for IntersectionObserver */}
        <Card ref={marginCardRef} style={{ textAlign:'center', padding:'32px 24px', minHeight:'180px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px' }}>
          {margin1 === null ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
              <Sparkles size={22} color={C.gold} style={{ opacity:0.55 }}/>
              <div style={{ fontFamily:SERIF, fontSize:'18px', color:C.mute, fontWeight:350, maxWidth:'300px', lineHeight:1.45, fontStyle:'italic', animation:'pulse 2.4s ease-in-out infinite' }}>{progressText}</div>
              {!isMulti && <div style={{ display:'flex', gap:'6px', marginTop:'2px' }}>{[0,1,2].map(i=><div key={i} style={{ width:'26px', height:'4px', borderRadius:'4px', background:i<filled?C.gold:C.paper2, transition:'background .3s' }}/>)}</div>}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'14px', width:'100%', animation:'fadeSlide .45s ease' }}>
              <div style={{ fontFamily:MONO, fontSize:'10px', fontWeight:500, letterSpacing:'0.16em', color:C.mute, textAlign:'center' }}>
                BUYER'S MARGIN · BUYER QUOTE{isMulti ? ` · ${margin1.ornamentCount} ORNAMENTS` : ''}
              </div>
              <div style={{ background:C.paper2, border:`1px solid rgba(26,20,38,.1)`, borderRadius:'6px', padding:'16px', textAlign:'center', width:'100%', boxSizing:'border-box' }}>
                <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'12px 28px' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:MONO, fontSize:'9px', fontWeight:500, letterSpacing:'0.14em', color:C.mute, marginBottom:'6px' }}>YOU RECEIVE</div>
                    <div style={{ fontFamily:SERIF, fontSize:'36px', fontWeight:350, color:C.ink, letterSpacing:'-0.025em', lineHeight:1 }}>₹{fmt(margin1.total,0)}</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:MONO, fontSize:'9px', fontWeight:500, letterSpacing:'0.14em', color:C.mute, marginBottom:'6px' }}>{isMulti?'BLENDED 24K RATE':'EFFECTIVE 24K RATE'}</div>
                    <div style={{ fontFamily:SERIF, fontSize:'24px', fontWeight:350, color:C.ink, letterSpacing:'-0.02em', lineHeight:1 }}>₹{fmt(margin1.eff,0)}<span style={{ fontSize:'14px', color:C.mute }}>/g</span></div>
                  </div>
                </div>
                {isMulti && <div style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, marginTop:'8px', letterSpacing:'0.04em' }}>Weighted across {margin1.ornamentCount} ornaments · after {feeN}% fee</div>}
              </div>
              <div style={{ width:'40px', height:'1px', background:C.paper2 }}/>
              <div style={{ fontFamily:SERIF, fontSize:'68px', fontWeight:350, lineHeight:1, letterSpacing:'-0.04em', color:t1.fg }}>{margin1.value.toFixed(1)}%</div>
              <div style={{ fontSize:'13px', fontWeight:600, padding:'7px 14px', borderRadius:'4px', background:t1.bg, color:t1.fg, letterSpacing:'0.01em', fontFamily:SANS }}>{t1.label}</div>

              {isMulti && (
                <>
                  <button style={{ background:'transparent', border:'none', color:C.gold, fontSize:'12px', fontWeight:500, fontFamily:MONO, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 8px', letterSpacing:'0.1em' }} onClick={()=>setShowBreakdown(v=>!v)}>
                    {showBreakdown?<ChevronUp size={14}/>:<ChevronDown size={14}/>}{showBreakdown?'HIDE BREAKDOWN':'PER-ORNAMENT BREAKDOWN'}
                  </button>
                  {showBreakdown && (
                    <div style={{ marginTop:'8px', width:'100%', textAlign:'left', animation:'fadeSlide .3s ease' }}>
                      {ornamentData.filter(x=>x.isValid).map((d,i) => {
                        const fee=feeN/100, effPF=d.effRate*(1-fee), cPF=d.purchaseContrib*(1-fee);
                        return (
                          <div key={d.id} style={{ padding:'14px 0', borderTop:i===0?'none':`1px dashed rgba(26,20,38,.08)` }}>
                            <div style={{ fontFamily:MONO, fontSize:'10px', fontWeight:500, letterSpacing:'0.14em', color:C.gold, marginBottom:'10px', display:'flex', alignItems:'center', gap:'8px' }}>
                              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'20px', height:'20px', borderRadius:'50%', background:C.paper2, color:C.plum, fontFamily:SERIF, fontSize:'11px' }}>{i+1}</span>
                              ORNAMENT {i+1}
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', rowGap:'10px', columnGap:'18px' }}>
                              {[['Net weight',`${fmt(d.netWeight)}g`],['Purity',`${d.purity}%`],['24K rate (post-fee)',`₹${fmt(effPF,0)}/g`],['Sub-total',`₹${fmt(cPF,0)}`]].map(([l,v]) => (
                                <div key={l} style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                                  <span style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, letterSpacing:'0.04em' }}>{l}</span>
                                  <span style={{ fontSize:'14px', color:C.ink, fontWeight:600, fontFamily:SERIF, letterSpacing:'-0.01em' }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {(() => {
                        const valid=ornamentData.filter(x=>x.isValid),tG=valid.reduce((a,d)=>a+d.gross,0),tN=valid.reduce((a,d)=>a+d.netWeight,0),tD=valid.reduce((a,d)=>a+d.stone+d.wastage,0);
                        return (
                          <div style={{ marginTop:'14px', paddingTop:'16px', borderTop:`1px solid rgba(184,136,58,.2)` }}>
                            <div style={{ fontFamily:MONO, fontSize:'10px', fontWeight:500, letterSpacing:'0.14em', color:C.gold, marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
                              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'20px', height:'20px', borderRadius:'50%', background:C.gold, color:C.white, fontFamily:SERIF, fontSize:'11px' }}>Σ</span>
                              TOTAL LOT
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', rowGap:'10px', columnGap:'18px' }}>
                              {[['Gross weight',`${fmt(tG)}g`],['Total deducted',`${fmt(tD)}g`],['Net weight',`${fmt(tN)}g`],['You receive',`₹${fmt(margin1.total,0)}`]].map(([l,v]) => (
                                <div key={l} style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                                  <span style={{ fontFamily:MONO, fontSize:'10px', color:C.mute, letterSpacing:'0.04em' }}>{l}</span>
                                  <span style={{ fontSize:'14px', color:C.ink, fontWeight:600, fontFamily:SERIF, letterSpacing:'-0.01em' }}>{v}</span>
                                </div>
                              ))}
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
        </Card>

        {/* Revised offer */}
        {margin1 !== null && (
          <div ref={attachRevisedObserver}>
            <Card style={{ marginBottom:'14px', animation:'fadeSlide .5s ease' }}>
              <Eyebrow>Did They Revise the Offer?</Eyebrow>
              <div style={{ fontSize:'14px', color:C.mute, lineHeight:1.55, marginBottom:'18px' }}>Buyers usually negotiate. Enter the revised <b style={{ color:C.ink }}>total</b> they're offering{isMulti?' for the full lot':''} — the final amount you'd receive.</div>
              <div style={pfxWrap}>
                <span style={pfx}>₹</span>
                <input type="number" inputMode="decimal" placeholder="e.g. 13800" value={revisedTotal} onChange={e=>setRevG(e.target.value)} style={{ ...INP, paddingLeft:'30px' }}/>
              </div>
              {margin2 !== null && (
                <div style={{ marginTop:'16px', padding:'18px', borderRadius:'6px', textAlign:'center', background:t2.bg, animation:'fadeSlide .3s ease' }}>
                  <div style={{ fontFamily:MONO, fontSize:'10px', fontWeight:500, letterSpacing:'0.14em', color:C.mute, marginBottom:'8px' }}>REVISED OFFER</div>
                  <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'10px 24px', marginBottom:'10px' }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:MONO, fontSize:'9px', color:C.mute, marginBottom:'3px', letterSpacing:'0.1em' }}>YOU RECEIVE</div>
                      <div style={{ fontFamily:SERIF, fontSize:'28px', fontWeight:350, color:C.ink, letterSpacing:'-0.02em', lineHeight:1 }}>₹{fmt(margin2.total,0)}</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:MONO, fontSize:'9px', color:C.mute, marginBottom:'3px', letterSpacing:'0.1em' }}>{isMulti?'BLENDED RATE':'EFFECTIVE RATE'}</div>
                      <div style={{ fontFamily:SERIF, fontSize:'18px', fontWeight:350, color:C.ink, letterSpacing:'-0.02em', lineHeight:1 }}>₹{fmt(margin2.eff,0)}/g</div>
                    </div>
                  </div>
                  <div style={{ fontFamily:SERIF, fontSize:'40px', fontWeight:350, lineHeight:1, letterSpacing:'-0.03em', color:t2.fg }}>{margin2.value.toFixed(1)}%</div>
                  <div style={{ fontSize:'13px', marginTop:'8px', fontWeight:600, color:C.ink, display:'inline-flex', alignItems:'center', gap:'4px', fontFamily:SANS }}>
                    {margin2.value<margin1.value ? <><TrendingDown size={13}/>Margin dropped by {(margin1.value-margin2.value).toFixed(1)} pp</> : <>No improvement — keep pushing</>}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* CTA */}
        {margin1 !== null && (
          <Card dark style={{ marginBottom:'14px', animation:'fadeSlide .55s ease', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-50px', right:'-50px', width:'160px', height:'160px', borderRadius:'50%', background:`radial-gradient(circle,rgba(224,183,101,.15) 0%,transparent 70%)`, pointerEvents:'none' }}/>
            <div style={{ fontFamily:SERIF, fontSize:'26px', fontWeight:350, color:C.gold3, letterSpacing:'-0.02em', marginBottom:'10px', position:'relative' }}>Want a better price?</div>
            <div style={{ fontSize:'14px', color:`rgba(241,215,141,.6)`, lineHeight:1.6, marginBottom:'18px', position:'relative' }}>Share your number and we'll send you a quote on WhatsApp.</div>
            <div style={{ display:'flex', alignItems:'center', background:C.white, borderRadius:'4px', padding:'0 0 0 14px', overflow:'hidden', marginBottom:'14px', position:'relative' }}>
              <span style={{ fontSize:'16px', color:C.mute, fontWeight:500, paddingRight:'10px', borderRight:`1px solid rgba(26,20,38,.12)`, fontFamily:SANS }}>+91</span>
              <input type="tel" inputMode="numeric" placeholder="10-digit mobile number" value={mobile} onChange={e=>setMobileG(e.target.value)} style={{ flex:1, border:'none', background:'transparent', padding:'14px', fontSize:'16px', fontWeight:500, color:C.ink, outline:'none', minWidth:0, fontFamily:SANS }}/>
            </div>
            <BtnWhatsApp onClick={onCTA} disabled={!mobileValid}>
              <MessageCircle size={18}/> Get a better offer on WhatsApp
            </BtnWhatsApp>
            <div style={{ fontFamily:MONO, fontSize:'11px', color:`rgba(241,215,141,.35)`, marginTop:'12px', textAlign:'center', lineHeight:1.5, letterSpacing:'0.04em', position:'relative' }}>
              By submitting, you agree to be contacted about your gold sale.
            </div>
          </Card>
        )}

        {margin1 !== null && <ShareSection/>}
      </div>

      {/* Floating share button — always visible, highlights on viewport trigger */}
      <FloatingShareButton highlighted={shareHighlighted}/>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { route, navigate } = useRoute();
  const spot = useSpotRate();
  useSEO(route);
  let page;
  if      (route==='/sell')   page = <SellPage   navigate={navigate} spot={spot}/>;
  else if (route==='/buy')    page = <BuyPage    navigate={navigate} spot={spot}/>;
  else if (route==='/margin') page = <MarginPage navigate={navigate} spot={spot}/>;
  else                        page = <HomePage   navigate={navigate} spot={spot}/>;
  return <><style>{GLOBAL_CSS}</style>{page}</>;
}
