import React, { useState, useEffect, useRef } from 'react';

// ── Shared: scroll-triggered visibility hook ──────────────────────────────────
const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

// ── Shared: pulsing dot ───────────────────────────────────────────────────────
const Pulse = ({ color = 'bg-cyan-400', size = 'w-2.5 h-2.5' }) => (
  <span className="relative flex">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
    <span className={`relative inline-flex rounded-full ${size} ${color}`} />
  </span>
);

// ── 1. LOAD BALANCER — animated traffic distribution ─────────────────────────
export const LoadBalancerAnimation = () => {
  const [ref, visible] = useInView(0.1);
  const [tick, setTick] = useState(0);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setTick(t => t + 1);
      setActive(Math.floor(Math.random() * 3));
    }, 900);
    return () => clearInterval(id);
  }, [visible]);

  const servers = [
    { label: 'EC2 #1', color: 'border-cyan-500 bg-cyan-500/10', dot: 'bg-cyan-400' },
    { label: 'EC2 #2', color: 'border-blue-500 bg-blue-500/10', dot: 'bg-blue-400' },
    { label: 'EC2 #3', color: 'border-purple-500 bg-purple-500/10', dot: 'bg-purple-400' },
  ];

  return (
    <div ref={ref} className="flex flex-col items-center gap-4 py-4 select-none">
      {/* Internet */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-500/40 bg-slate-500/10 text-slate-300 text-sm font-semibold">
        🌐 Internet Traffic
      </div>
      {/* Arrow down */}
      <div className="flex flex-col items-center gap-0.5">
        {[0,1,2].map(i => (
          <div key={i} className={`w-0.5 h-2 rounded transition-all duration-300 ${visible ? 'bg-cyan-400 opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: `${i * 80}ms` }} />
        ))}
        <div className={`text-cyan-400 text-xs transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>▼</div>
      </div>
      {/* ALB */}
      <div className={`px-6 py-3 rounded-2xl border-2 border-cyan-500 bg-cyan-500/15 text-cyan-300 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all duration-700 ${visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        ⚖️ Application Load Balancer
        <div className="text-xs text-cyan-400/70 font-normal mt-0.5 text-center">Health checks · SSL termination · Routing rules</div>
      </div>
      {/* Fan-out arrows */}
      <div className="flex items-start justify-center gap-8 w-full max-w-sm">
        {servers.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${active === i ? 'opacity-100' : 'opacity-30'}`}>
              {[0,1].map(j => (
                <div key={j} className={`w-0.5 h-2 rounded ${s.dot}`} />
              ))}
              <div className={`text-xs ${s.dot.replace('bg-','text-')}`}>▼</div>
            </div>
            <div className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold text-center transition-all duration-300 ${s.color} ${active === i ? 'scale-105 shadow-lg' : 'scale-100'}`}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Pulse color={s.dot} size="w-2 h-2" />
                <span className="text-white/80">{s.label}</span>
              </div>
              <div className="text-white/50 text-[10px]">Healthy</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-1 text-center max-w-xs">
        ALB distributes each request to a healthy target. Unhealthy instances are automatically removed.
      </p>
    </div>
  );
};

// ── 2. AUTO SCALING (ASG) — scale out / scale in ─────────────────────────────
export const AutoScalingAnimation = () => {
  const [ref, visible] = useInView(0.1);
  const [count, setCount] = useState(2);
  const [phase, setPhase] = useState('idle'); // idle | scaling-out | peak | scaling-in

  useEffect(() => {
    if (!visible) return;
    const seq = [
      { delay: 600,  fn: () => { setPhase('scaling-out'); setCount(2); } },
      { delay: 1400, fn: () => setCount(3) },
      { delay: 2200, fn: () => setCount(4) },
      { delay: 3000, fn: () => setCount(5) },
      { delay: 3800, fn: () => setPhase('peak') },
      { delay: 5000, fn: () => setPhase('scaling-in') },
      { delay: 5800, fn: () => setCount(4) },
      { delay: 6600, fn: () => setCount(3) },
      { delay: 7400, fn: () => setCount(2) },
      { delay: 8200, fn: () => setPhase('idle') },
    ];
    const timers = seq.map(s => setTimeout(s.fn, s.delay));
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  const phaseLabel = { idle: 'Normal traffic', 'scaling-out': '📈 Traffic spike — scaling OUT', peak: '🔥 Peak — 5 instances running', 'scaling-in': '📉 Traffic drops — scaling IN' };
  const phaseColor = { idle: 'text-slate-400', 'scaling-out': 'text-orange-400', peak: 'text-red-400', 'scaling-in': 'text-green-400' };

  return (
    <div ref={ref} className="flex flex-col items-center gap-5 py-4 select-none">
      <div className={`text-sm font-semibold transition-colors duration-500 ${phaseColor[phase]}`}>
        {phaseLabel[phase]}
      </div>
      {/* CPU meter */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>CPU Utilization</span>
          <span>{phase === 'peak' ? '85%' : phase === 'scaling-out' ? '72%' : phase === 'scaling-in' ? '45%' : '30%'}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${
            phase === 'peak' ? 'w-[85%] bg-red-500' :
            phase === 'scaling-out' ? 'w-[72%] bg-orange-500' :
            phase === 'scaling-in' ? 'w-[45%] bg-yellow-500' : 'w-[30%] bg-green-500'
          }`} />
        </div>
        <div className="text-[10px] text-slate-500 mt-1">Target: 50% → triggers scale-out above 70%</div>
      </div>
      {/* Instance grid */}
      <div className="flex gap-3 flex-wrap justify-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const alive = i < count;
          return (
            <div key={i} className={`flex flex-col items-center gap-1 transition-all duration-500 ${alive ? 'opacity-100 scale-100' : 'opacity-20 scale-90'}`}>
              <div className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xl transition-all duration-500 ${
                alive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600 bg-slate-800'
              }`}>
                🖥️
              </div>
              <span className={`text-[10px] font-medium ${alive ? 'text-cyan-400' : 'text-slate-600'}`}>
                {alive ? 'Running' : 'Standby'}
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-slate-400 text-center max-w-xs">
        Min: 2 · Desired: {count} · Max: 5 — ASG automatically adjusts based on CloudWatch metrics
      </div>
    </div>
  );
};

// ── 3. ROUTE 53 — routing policies visualized ────────────────────────────────
export const Route53Animation = () => {
  const [ref, visible] = useInView(0.1);
  const [policy, setPolicy] = useState('latency');

  const policies = [
    { id: 'latency', label: 'Latency-based', icon: '⚡' },
    { id: 'failover', label: 'Failover', icon: '🔄' },
    { id: 'weighted', label: 'Weighted', icon: '⚖️' },
    { id: 'geo', label: 'Geolocation', icon: '🌍' },
  ];

  const regions = [
    { id: 'us', label: 'us-east-1', flag: '🇺🇸', latency: '12ms' },
    { id: 'eu', label: 'eu-west-1', flag: '🇪🇺', latency: '85ms' },
    { id: 'ap', label: 'ap-south-1', flag: '🇮🇳', latency: '210ms' },
  ];

  const getActive = () => {
    if (policy === 'latency') return ['us'];
    if (policy === 'failover') return ['us'];
    if (policy === 'weighted') return ['us', 'eu', 'ap'];
    if (policy === 'geo') return ['us'];
    return ['us'];
  };

  const getWeight = (id) => {
    if (policy === 'weighted') return id === 'us' ? '70%' : id === 'eu' ? '20%' : '10%';
    return null;
  };

  const active = getActive();

  return (
    <div ref={ref} className={`flex flex-col items-center gap-5 py-4 select-none transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {/* Policy selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {policies.map(p => (
          <button key={p.id} onClick={() => setPolicy(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
              policy === p.id ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300' : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-400'
            }`}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>
      {/* User */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-500/40 bg-slate-500/10 text-slate-300 text-sm font-semibold">
        👤 User in New York
      </div>
      <div className="text-cyan-400 text-xs">DNS query ▼</div>
      {/* Route 53 */}
      <div className="px-5 py-2.5 rounded-xl border-2 border-cyan-500 bg-cyan-500/15 text-cyan-300 font-bold text-sm">
        🌐 Route 53 — {policies.find(p => p.id === policy)?.label} routing
      </div>
      {/* Regions */}
      <div className="flex gap-4 flex-wrap justify-center">
        {regions.map(r => {
          const isActive = active.includes(r.id);
          const weight = getWeight(r.id);
          return (
            <div key={r.id} className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-25'}`}>
              <div className={`text-cyan-400 text-xs transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>▼</div>
              <div className={`px-4 py-3 rounded-xl border-2 text-center transition-all duration-500 ${
                isActive ? 'border-cyan-500 bg-cyan-500/10 scale-105' : 'border-slate-600 bg-slate-800 scale-95'
              }`}>
                <div className="text-lg">{r.flag}</div>
                <div className="text-xs font-semibold text-white/80 mt-0.5">{r.label}</div>
                <div className="text-[10px] text-slate-400">{r.latency}</div>
                {weight && <div className="text-[10px] text-orange-400 font-bold mt-0.5">{weight}</div>}
              </div>
              {policy === 'failover' && r.id === 'us' && <span className="text-[10px] text-green-400 font-semibold">PRIMARY ✓</span>}
              {policy === 'failover' && r.id === 'eu' && <span className="text-[10px] text-slate-500">STANDBY</span>}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 text-center max-w-xs">
        {policy === 'latency' && 'Routes to the region with lowest latency for the user'}
        {policy === 'failover' && 'Routes to primary; switches to standby if health check fails'}
        {policy === 'weighted' && 'Splits traffic by percentage — great for canary deployments'}
        {policy === 'geo' && 'Routes based on user\'s geographic location'}
      </p>
    </div>
  );
};

// ── 4. RDS — Multi-AZ failover + read replicas ───────────────────────────────
export const RDSAnimation = () => {
  const [ref, visible] = useInView(0.1);
  const [mode, setMode] = useState('normal'); // normal | failover

  useEffect(() => {
    if (!visible) return;
    const t1 = setTimeout(() => setMode('failover'), 3000);
    const t2 = setTimeout(() => setMode('normal'), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  return (
    <div ref={ref} className={`flex flex-col items-center gap-4 py-4 select-none transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className={`text-sm font-semibold transition-colors duration-500 ${mode === 'failover' ? 'text-red-400' : 'text-green-400'}`}>
        {mode === 'failover' ? '🔴 Primary AZ failure — automatic failover in progress...' : '🟢 Normal operation'}
      </div>
      <div className="flex gap-6 items-start flex-wrap justify-center">
        {/* App */}
        <div className="flex flex-col items-center gap-2">
          <div className="px-4 py-2.5 rounded-xl border-2 border-blue-500 bg-blue-500/10 text-blue-300 text-xs font-semibold text-center">
            🖥️ Application<br/><span className="text-[10px] text-blue-400/70">RDS Proxy</span>
          </div>
          <div className={`text-xs transition-colors duration-500 ${mode === 'failover' ? 'text-yellow-400' : 'text-blue-400'}`}>
            {mode === 'failover' ? '⏳ reconnecting...' : '✓ connected'}
          </div>
        </div>
        {/* Primary */}
        <div className="flex flex-col items-center gap-2">
          <div className={`px-4 py-3 rounded-xl border-2 text-xs font-semibold text-center transition-all duration-500 ${
            mode === 'failover' ? 'border-red-500 bg-red-500/10 text-red-300 opacity-40' : 'border-green-500 bg-green-500/10 text-green-300'
          }`}>
            🗄️ Primary DB<br/><span className="text-[10px] opacity-70">us-east-1a · Writes</span>
          </div>
          {mode === 'failover' && <span className="text-[10px] text-red-400 font-bold animate-pulse">AZ FAILURE</span>}
          {mode !== 'failover' && <span className="text-[10px] text-green-400">Sync replication ↓</span>}
        </div>
        {/* Standby */}
        <div className="flex flex-col items-center gap-2">
          <div className={`px-4 py-3 rounded-xl border-2 text-xs font-semibold text-center transition-all duration-500 ${
            mode === 'failover' ? 'border-green-500 bg-green-500/10 text-green-300 scale-105 shadow-lg shadow-green-500/20' : 'border-slate-600 bg-slate-800 text-slate-400'
          }`}>
            🗄️ Standby DB<br/><span className="text-[10px] opacity-70">us-east-1b · {mode === 'failover' ? 'NOW PRIMARY' : 'Standby'}</span>
          </div>
          {mode === 'failover' && <span className="text-[10px] text-green-400 font-bold animate-pulse">PROMOTED ✓</span>}
        </div>
        {/* Read Replica */}
        <div className="flex flex-col items-center gap-2">
          <div className="px-4 py-3 rounded-xl border-2 border-purple-500 bg-purple-500/10 text-purple-300 text-xs font-semibold text-center">
            📖 Read Replica<br/><span className="text-[10px] opacity-70">us-east-1c · Reads only</span>
          </div>
          <span className="text-[10px] text-purple-400">Async replication</span>
        </div>
      </div>
      <p className="text-xs text-slate-400 text-center max-w-sm">
        Multi-AZ: synchronous standby for HA (60–120s failover). Read Replicas: async, serve read traffic to reduce primary load.
      </p>
    </div>
  );
};

// ── 5. S3 — storage class lifecycle ──────────────────────────────────────────
export const S3Animation = () => {
  const [ref, visible] = useInView(0.1);
  const [day, setDay] = useState(0);
  const [running, setRunning] = useState(false);

  const tiers = [
    { label: 'S3 Standard', days: 0,   color: 'border-cyan-500 bg-cyan-500/10 text-cyan-300',    cost: '$0.023/GB', icon: '🔥' },
    { label: 'Standard-IA', days: 30,  color: 'border-blue-500 bg-blue-500/10 text-blue-300',    cost: '$0.0125/GB', icon: '📦' },
    { label: 'Glacier',     days: 90,  color: 'border-purple-500 bg-purple-500/10 text-purple-300', cost: '$0.004/GB', icon: '🧊' },
    { label: 'Deep Archive', days: 365, color: 'border-slate-500 bg-slate-500/10 text-slate-300', cost: '$0.00099/GB', icon: '🏔️' },
  ];

  const currentTier = tiers.reduce((acc, t) => day >= t.days ? t : acc, tiers[0]);

  useEffect(() => {
    if (!visible || running) return;
    setRunning(true);
    let d = 0;
    const id = setInterval(() => {
      d += 15;
      setDay(d);
      if (d >= 400) { clearInterval(id); setTimeout(() => { setDay(0); setRunning(false); }, 1500); }
    }, 120);
    return () => clearInterval(id);
  }, [visible, running]);

  return (
    <div ref={ref} className={`flex flex-col items-center gap-5 py-4 select-none transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className="text-sm text-slate-300 font-semibold">S3 Lifecycle Policy — Day <span className="text-cyan-400 font-bold">{day}</span></div>
      {/* Timeline bar */}
      <div className="w-full max-w-sm">
        <div className="relative h-3 rounded-full bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 via-purple-500 to-slate-500 transition-all duration-200"
            style={{ width: `${Math.min((day / 400) * 100, 100)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Day 0</span><span>Day 30</span><span>Day 90</span><span>Day 365</span>
        </div>
      </div>
      {/* Tier cards */}
      <div className="flex gap-3 flex-wrap justify-center">
        {tiers.map((t, i) => (
          <div key={i} className={`px-3 py-3 rounded-xl border-2 text-center text-xs transition-all duration-500 ${t.color} ${
            currentTier.label === t.label ? 'scale-110 shadow-lg' : 'scale-95 opacity-50'
          }`}>
            <div className="text-lg mb-1">{t.icon}</div>
            <div className="font-bold">{t.label}</div>
            <div className="text-[10px] opacity-70 mt-0.5">{t.cost}</div>
            <div className="text-[10px] opacity-60">Day {t.days}+</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center max-w-xs">
        Lifecycle policies automatically move objects to cheaper tiers as they age — saving up to 95% on storage costs.
      </p>
    </div>
  );
};

// ── 6. API GATEWAY — request flow ────────────────────────────────────────────
export const APIGatewayAnimation = () => {
  const [ref, visible] = useInView(0.1);
  const [step, setStep] = useState(-1);

  const steps = [
    { id: 0, label: '👤 Client', sub: 'POST /orders', color: 'border-slate-500 bg-slate-500/10 text-slate-300' },
    { id: 1, label: '🔐 Authorizer', sub: 'Validate JWT token', color: 'border-yellow-500 bg-yellow-500/10 text-yellow-300' },
    { id: 2, label: '⚖️ Throttle', sub: '10k req/s limit', color: 'border-orange-500 bg-orange-500/10 text-orange-300' },
    { id: 3, label: '🔄 Transform', sub: 'Map request body', color: 'border-blue-500 bg-blue-500/10 text-blue-300' },
    { id: 4, label: 'λ Lambda', sub: 'Business logic', color: 'border-cyan-500 bg-cyan-500/10 text-cyan-300' },
    { id: 5, label: '🗄️ DynamoDB', sub: 'Persist order', color: 'border-purple-500 bg-purple-500/10 text-purple-300' },
    { id: 6, label: '✅ Response', sub: '201 Created', color: 'border-green-500 bg-green-500/10 text-green-300' },
  ];

  useEffect(() => {
    if (!visible) return;
    let s = -1;
    const id = setInterval(() => {
      s++;
      setStep(s);
      if (s >= steps.length - 1) { clearInterval(id); setTimeout(() => setStep(-1), 1500); }
    }, 700);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <div ref={ref} className={`flex flex-col items-center gap-2 py-4 select-none transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className="text-sm text-slate-300 font-semibold mb-2">API Gateway Request Lifecycle</div>
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className={`w-full max-w-xs px-4 py-2.5 rounded-xl border-2 flex items-center justify-between transition-all duration-400 ${s.color} ${
            step === i ? 'scale-105 shadow-lg' : step > i ? 'opacity-60 scale-100' : 'opacity-30 scale-95'
          }`}>
            <span className="font-semibold text-sm">{s.label}</span>
            <span className="text-[11px] opacity-70">{s.sub}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`text-xs transition-all duration-300 ${step > i ? 'text-cyan-400 opacity-100' : 'text-slate-600 opacity-40'}`}>▼</div>
          )}
        </React.Fragment>
      ))}
      <p className="text-xs text-slate-400 text-center max-w-xs mt-2">
        Every request flows through auth → throttle → transform → backend → response. API Gateway handles all of this for you.
      </p>
    </div>
  );
};

// ── 7. CDN (CloudFront) — cache hit vs miss ───────────────────────────────────
export const CDNAnimation = () => {
  const [ref, visible] = useInView(0.1);
  const [scenario, setScenario] = useState('miss');
  const [animStep, setAnimStep] = useState(-1);

  const missSteps = ['👤 User (Tokyo)', '🌐 Edge (Tokyo)', '🔍 Cache MISS', '🌎 Origin (us-east-1)', '📦 Fetch + Cache', '✅ Serve (210ms)'];
  const hitSteps  = ['👤 User (Tokyo)', '🌐 Edge (Tokyo)', '✅ Cache HIT', '⚡ Serve (8ms)'];
  const steps = scenario === 'miss' ? missSteps : hitSteps;

  useEffect(() => {
    if (!visible) return;
    let s = -1;
    const id = setInterval(() => {
      s++;
      setAnimStep(s);
      if (s >= steps.length - 1) {
        clearInterval(id);
        setTimeout(() => {
          setScenario(sc => sc === 'miss' ? 'hit' : 'miss');
          setAnimStep(-1);
        }, 1200);
      }
    }, 600);
    return () => clearInterval(id);
  }, [visible, scenario]);

  const stepColor = (i) => {
    if (scenario === 'miss') {
      if (i === 2) return 'border-red-500 bg-red-500/10 text-red-300';
      if (i === 5) return 'border-green-500 bg-green-500/10 text-green-300';
      return 'border-blue-500 bg-blue-500/10 text-blue-300';
    }
    if (i === 2) return 'border-green-500 bg-green-500/10 text-green-300';
    if (i === 3) return 'border-green-500 bg-green-500/10 text-green-300';
    return 'border-cyan-500 bg-cyan-500/10 text-cyan-300';
  };

  return (
    <div ref={ref} className={`flex flex-col items-center gap-2 py-4 select-none transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className="flex gap-3 mb-2">
        <div className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${scenario === 'miss' ? 'border-red-500 bg-red-500/20 text-red-300' : 'border-slate-600 text-slate-500'}`}>
          Cache MISS (first request)
        </div>
        <div className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${scenario === 'hit' ? 'border-green-500 bg-green-500/20 text-green-300' : 'border-slate-600 text-slate-500'}`}>
          Cache HIT (repeat request)
        </div>
      </div>
      {steps.map((s, i) => (
        <React.Fragment key={`${scenario}-${i}`}>
          <div className={`w-full max-w-xs px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-center transition-all duration-400 ${stepColor(i)} ${
            animStep === i ? 'scale-105 shadow-lg' : animStep > i ? 'opacity-70' : 'opacity-25 scale-95'
          }`}>
            {s}
          </div>
          {i < steps.length - 1 && (
            <div className={`text-xs transition-colors duration-300 ${animStep > i ? 'text-cyan-400' : 'text-slate-600'}`}>▼</div>
          )}
        </React.Fragment>
      ))}
      <p className="text-xs text-slate-400 text-center max-w-xs mt-2">
        Cache miss: origin fetch takes ~200ms. Cache hit: edge serves in &lt;10ms. CloudFront has 600+ edge locations globally.
      </p>
    </div>
  );
};

// ── 8. SQS — visibility timeout + message lifecycle ──────────────────────────
export const SQSAnimation = () => {
  const [ref, visible] = useInView(0.1);
  const [msgs, setMsgs] = useState([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!visible) return;
    // seed initial messages
    setMsgs([
      { id: 1, state: 'queued', retries: 0, label: 'Order #101' },
      { id: 2, state: 'queued', retries: 0, label: 'Order #102' },
      { id: 3, state: 'queued', retries: 0, label: 'Order #103' },
    ]);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setTick(t => t + 1);
      setMsgs(prev => {
        let next = prev.map(m => {
          if (m.state === 'queued') return { ...m, state: 'processing' };
          if (m.state === 'processing') {
            // msg id=2 always fails to simulate DLQ
            if (m.id === 2) {
              const r = m.retries + 1;
              return r >= 3 ? { ...m, state: 'dlq', retries: r } : { ...m, state: 'queued', retries: r };
            }
            return { ...m, state: 'done' };
          }
          return m;
        });
        // reset done messages after a cycle
        if (next.every(m => m.state === 'done' || m.state === 'dlq')) {
          setTimeout(() => setMsgs([
            { id: 1, state: 'queued', retries: 0, label: 'Order #101' },
            { id: 2, state: 'queued', retries: 0, label: 'Order #102' },
            { id: 3, state: 'queued', retries: 0, label: 'Order #103' },
          ]), 1800);
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(id);
  }, [visible]);

  const stateStyle = {
    queued:     'border-blue-500 bg-blue-500/10 text-blue-300',
    processing: 'border-yellow-500 bg-yellow-500/10 text-yellow-300 animate-pulse',
    done:       'border-green-500 bg-green-500/10 text-green-300',
    dlq:        'border-red-500 bg-red-500/10 text-red-300',
  };
  const stateLabel = { queued: '📬 Queued', processing: '⚙️ Processing', done: '✅ Deleted', dlq: '💀 DLQ' };

  return (
    <div ref={ref} className={`flex flex-col items-center gap-5 py-4 select-none transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className="text-sm text-slate-300 font-semibold">SQS Message Lifecycle</div>
      <div className="flex gap-3 flex-wrap justify-center w-full max-w-lg">
        {msgs.map(m => (
          <div key={m.id} className={`flex-1 min-w-[120px] px-3 py-3 rounded-xl border-2 text-center text-xs transition-all duration-500 ${stateStyle[m.state]}`}>
            <div className="font-bold mb-1">{m.label}</div>
            <div className="font-semibold">{stateLabel[m.state]}</div>
            {m.retries > 0 && <div className="text-[10px] opacity-70 mt-0.5">Attempt {m.retries}/3</div>}
          </div>
        ))}
      </div>
      {/* Queue + DLQ visual */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="px-4 py-2.5 rounded-xl border-2 border-blue-500 bg-blue-500/10 text-blue-300 text-xs font-semibold text-center">
          📥 Main Queue<br/><span className="text-[10px] opacity-70">maxReceiveCount: 3</span>
        </div>
        <div className="text-slate-400 text-sm">→ fail 3× →</div>
        <div className="px-4 py-2.5 rounded-xl border-2 border-red-500 bg-red-500/10 text-red-300 text-xs font-semibold text-center">
          💀 Dead Letter Queue<br/><span className="text-[10px] opacity-70">Inspect &amp; alert</span>
        </div>
      </div>
      <p className="text-xs text-slate-400 text-center max-w-xs">
        Messages that fail processing 3× are moved to the DLQ. Monitor DLQ depth with CloudWatch alarms.
      </p>
    </div>
  );
};

// ── 9. SNS Fan-Out — one publish, many consumers ─────────────────────────────
export const SNSAnimation = () => {
  const [ref, visible] = useInView(0.1);
  const [phase, setPhase] = useState('idle'); // idle | publishing | fanout | done

  const subscribers = [
    { label: '📦 Inventory', queue: 'SQS', color: 'border-blue-500 bg-blue-500/10 text-blue-300' },
    { label: '💳 Payment',   queue: 'SQS', color: 'border-purple-500 bg-purple-500/10 text-purple-300' },
    { label: '📧 Email',     queue: 'Lambda', color: 'border-green-500 bg-green-500/10 text-green-300' },
    { label: '📱 Push',      queue: 'Mobile', color: 'border-orange-500 bg-orange-500/10 text-orange-300' },
  ];

  useEffect(() => {
    if (!visible) return;
    const seq = [
      { delay: 500,  fn: () => setPhase('publishing') },
      { delay: 1400, fn: () => setPhase('fanout') },
      { delay: 3000, fn: () => setPhase('done') },
      { delay: 4500, fn: () => setPhase('idle') },
    ];
    const timers = seq.map(s => setTimeout(s.fn, s.delay));
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  // re-trigger on idle
  useEffect(() => {
    if (phase !== 'idle' || !visible) return;
    const t = setTimeout(() => setPhase('publishing'), 800);
    return () => clearTimeout(t);
  }, [phase, visible]);

  return (
    <div ref={ref} className={`flex flex-col items-center gap-4 py-4 select-none transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {/* Publisher */}
      <div className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-500 ${
        phase === 'publishing' ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300 scale-105 shadow-lg shadow-cyan-500/20' : 'border-slate-600 bg-slate-800 text-slate-300'
      }`}>
        🛒 Order Service
        {phase === 'publishing' && <span className="ml-2 text-xs text-cyan-400 animate-pulse">publishing event...</span>}
      </div>
      <div className={`text-cyan-400 text-xs transition-opacity duration-300 ${phase !== 'idle' ? 'opacity-100' : 'opacity-20'}`}>▼</div>
      {/* SNS Topic */}
      <div className={`px-6 py-3 rounded-2xl border-2 font-bold text-sm text-center transition-all duration-500 ${
        phase === 'fanout' || phase === 'publishing'
          ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-lg shadow-cyan-500/20'
          : 'border-slate-600 bg-slate-800 text-slate-400'
      }`}>
        📣 SNS Topic: order-placed
        <div className="text-[10px] font-normal opacity-70 mt-0.5">4 subscribers</div>
      </div>
      {/* Fan-out arrows + subscribers */}
      <div className="flex gap-3 flex-wrap justify-center">
        {subscribers.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={`text-xs transition-all duration-300 ${phase === 'fanout' || phase === 'done' ? 'text-cyan-400 opacity-100' : 'text-slate-600 opacity-30'}`}
              style={{ transitionDelay: `${i * 120}ms` }}>▼</div>
            <div className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold text-center transition-all duration-500 ${s.color} ${
              phase === 'fanout' || phase === 'done' ? 'scale-105 opacity-100' : 'scale-90 opacity-30'
            }`} style={{ transitionDelay: `${i * 120}ms` }}>
              <div>{s.label}</div>
              <div className="text-[10px] opacity-60 mt-0.5">via {s.queue}</div>
              {phase === 'done' && <div className="text-[10px] text-green-400 mt-0.5">✓ delivered</div>}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center max-w-xs">
        One SNS publish fans out to all subscribers simultaneously — decoupled, parallel, no coordination needed.
      </p>
    </div>
  );
};

// ── 10. DLQ — retry exhaustion flow ──────────────────────────────────────────
export const DLQAnimation = () => {
  const [ref, visible] = useInView(0.1);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | processing | failed | dlq | alert

  useEffect(() => {
    if (!visible) return;
    const seq = [
      { delay: 400,  fn: () => { setAttempt(1); setPhase('processing'); } },
      { delay: 1200, fn: () => setPhase('failed') },
      { delay: 2000, fn: () => { setAttempt(2); setPhase('processing'); } },
      { delay: 2800, fn: () => setPhase('failed') },
      { delay: 3600, fn: () => { setAttempt(3); setPhase('processing'); } },
      { delay: 4400, fn: () => setPhase('failed') },
      { delay: 5200, fn: () => setPhase('dlq') },
      { delay: 6000, fn: () => setPhase('alert') },
      { delay: 7500, fn: () => { setAttempt(0); setPhase('idle'); } },
    ];
    const timers = seq.map(s => setTimeout(s.fn, s.delay));
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  useEffect(() => {
    if (phase !== 'idle' || !visible) return;
    const t = setTimeout(() => { setAttempt(1); setPhase('processing'); }, 800);
    return () => clearTimeout(t);
  }, [phase, visible]);

  const steps = [
    { label: '📬 Main Queue', active: attempt > 0, color: 'border-blue-500 bg-blue-500/10 text-blue-300' },
    { label: `⚙️ Consumer (attempt ${attempt || 1}/3)`, active: phase === 'processing', color: 'border-yellow-500 bg-yellow-500/10 text-yellow-300' },
    { label: '❌ Processing Failed', active: phase === 'failed', color: 'border-red-500 bg-red-500/10 text-red-300' },
    { label: '💀 Dead Letter Queue', active: phase === 'dlq' || phase === 'alert', color: 'border-red-600 bg-red-600/10 text-red-200' },
    { label: '🚨 CloudWatch Alarm', active: phase === 'alert', color: 'border-orange-500 bg-orange-500/10 text-orange-300' },
  ];

  return (
    <div ref={ref} className={`flex flex-col items-center gap-2 py-4 select-none transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className="text-sm text-slate-300 font-semibold mb-1">
        {phase === 'dlq' || phase === 'alert' ? '💀 Message sent to DLQ after 3 failed attempts' :
         phase === 'failed' ? `❌ Attempt ${attempt} failed — message returns to queue` :
         phase === 'processing' ? `⚙️ Processing attempt ${attempt}/3...` : 'Waiting for message...'}
      </div>
      {/* Retry counter */}
      <div className="flex gap-2 mb-2">
        {[1,2,3].map(i => (
          <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-400 ${
            attempt >= i
              ? phase === 'failed' && attempt === i ? 'border-red-500 bg-red-500/20 text-red-300'
              : phase === 'processing' && attempt === i ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300 animate-pulse'
              : 'border-red-500 bg-red-500/10 text-red-400'
              : 'border-slate-600 bg-slate-800 text-slate-600'
          }`}>
            {attempt > i ? '✗' : attempt === i && phase === 'processing' ? '…' : i}
          </div>
        ))}
      </div>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`w-full max-w-xs px-4 py-2.5 rounded-xl border-2 text-sm font-semibold text-center transition-all duration-400 ${s.color} ${
            s.active ? 'scale-105 shadow-lg opacity-100' : 'opacity-25 scale-95'
          }`}>
            {s.label}
          </div>
          {i < steps.length - 1 && (
            <div className={`text-xs transition-colors duration-300 ${s.active ? 'text-cyan-400' : 'text-slate-700'}`}>▼</div>
          )}
        </React.Fragment>
      ))}
      <p className="text-xs text-slate-400 text-center max-w-xs mt-2">
        Always configure a DLQ + CloudWatch alarm on DLQ depth. Messages in the DLQ = bugs to investigate.
      </p>
    </div>
  );
};

// ── 11. CI/CD Pipeline — code to production ───────────────────────────────────
export const CICDAnimation = () => {
  const [ref, visible] = useInView(0.1);
  const [activeStage, setActiveStage] = useState(-1);
  const [status, setStatus] = useState({}); // stageIdx -> 'running'|'pass'|'fail'

  const stages = [
    { label: '📝 Source',   sub: 'git push → CodeCommit / GitHub', color: 'cyan' },
    { label: '🔨 Build',    sub: 'CodeBuild: docker build, npm test', color: 'blue' },
    { label: '🧪 Test',     sub: 'Unit + integration tests, coverage', color: 'purple' },
    { label: '🚀 Staging',  sub: 'Deploy to staging, smoke tests', color: 'orange' },
    { label: '✅ Prod',     sub: 'Blue/green deploy, canary shift', color: 'green' },
  ];

  const colorMap = {
    cyan:   { border: 'border-cyan-500',   bg: 'bg-cyan-500/10',   text: 'text-cyan-300' },
    blue:   { border: 'border-blue-500',   bg: 'bg-blue-500/10',   text: 'text-blue-300' },
    purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-300' },
    orange: { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-300' },
    green:  { border: 'border-green-500',  bg: 'bg-green-500/10',  text: 'text-green-300' },
  };

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const run = () => {
      if (i >= stages.length) {
        setTimeout(() => { setActiveStage(-1); setStatus({}); i = 0; setTimeout(run, 600); }, 1500);
        return;
      }
      setActiveStage(i);
      setStatus(prev => ({ ...prev, [i]: 'running' }));
      setTimeout(() => {
        setStatus(prev => ({ ...prev, [i]: 'pass' }));
        i++;
        setTimeout(run, 400);
      }, 900);
    };
    const t = setTimeout(run, 400);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div ref={ref} className={`flex flex-col items-center gap-2 py-4 select-none transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className="text-sm text-slate-300 font-semibold mb-2">CodePipeline — Code to Production</div>
      {/* Horizontal pipeline on md+, vertical on mobile */}
      <div className="hidden md:flex items-center gap-1 w-full max-w-2xl">
        {stages.map((s, i) => {
          const c = colorMap[s.color];
          const st = status[i];
          return (
            <React.Fragment key={i}>
              <div className={`flex-1 px-2 py-3 rounded-xl border-2 text-center transition-all duration-500 ${c.border} ${c.bg} ${
                activeStage === i ? 'scale-105 shadow-lg' : st === 'pass' ? 'opacity-80' : 'opacity-30 scale-95'
              }`}>
                <div className={`text-sm font-bold ${c.text}`}>{s.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.sub}</div>
                <div className="mt-1.5 text-xs">
                  {st === 'running' && <span className="text-yellow-400 animate-pulse">⏳ running</span>}
                  {st === 'pass'    && <span className="text-green-400">✓ passed</span>}
                  {!st              && <span className="text-slate-600">waiting</span>}
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className={`text-lg transition-colors duration-300 ${st === 'pass' ? 'text-cyan-400' : 'text-slate-700'}`}>→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Mobile: vertical */}
      <div className="flex md:hidden flex-col items-center gap-1.5 w-full max-w-xs">
        {stages.map((s, i) => {
          const c = colorMap[s.color];
          const st = status[i];
          return (
            <React.Fragment key={i}>
              <div className={`w-full px-4 py-2.5 rounded-xl border-2 flex items-center justify-between transition-all duration-500 ${c.border} ${c.bg} ${
                activeStage === i ? 'scale-105 shadow-lg' : st === 'pass' ? 'opacity-80' : 'opacity-30'
              }`}>
                <div>
                  <div className={`text-sm font-bold ${c.text}`}>{s.label}</div>
                  <div className="text-[10px] text-slate-400">{s.sub}</div>
                </div>
                <div className="text-xs ml-2">
                  {st === 'running' && <span className="text-yellow-400 animate-pulse">⏳</span>}
                  {st === 'pass'    && <span className="text-green-400">✓</span>}
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className={`text-xs ${st === 'pass' ? 'text-cyan-400' : 'text-slate-700'}`}>▼</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 text-center max-w-sm mt-2">
        Every git push triggers the pipeline. Each stage must pass before the next runs. Failed stages block deployment and notify the team.
      </p>
    </div>
  );
};
