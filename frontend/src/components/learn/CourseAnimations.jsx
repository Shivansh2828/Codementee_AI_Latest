import React, { useState, useEffect } from 'react';

// Animated arrow between two boxes
const Arrow = ({ label, animated = true }) => (
  <div className="flex flex-col items-center justify-center mx-2 min-w-[60px]">
    <div className={`relative h-0.5 w-full bg-cyan-500 ${animated ? 'animate-pulse' : ''}`}>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-cyan-500" />
    </div>
    {label && <span className="text-xs text-cyan-400 mt-1 whitespace-nowrap">{label}</span>}
  </div>
);

const Box = ({ label, sublabel, color = 'blue', icon, pulse = false }) => {
  const colors = {
    blue: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    green: 'bg-green-500/20 border-green-500/40 text-green-300',
    purple: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    orange: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
    gray: 'bg-gray-500/20 border-gray-500/40 text-gray-300',
    red: 'bg-red-500/20 border-red-500/40 text-red-300',
  };
  return (
    <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl border ${colors[color]} ${pulse ? 'animate-pulse' : ''} min-w-[90px] text-center`}>
      {icon && <span className="text-2xl mb-1">{icon}</span>}
      <span className="text-sm font-semibold">{label}</span>
      {sublabel && <span className="text-xs opacity-70 mt-0.5">{sublabel}</span>}
    </div>
  );
};

// ── Client-Server Animation ──────────────────────────────────────────────────
export const ClientServerAnimation = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 1200);
    return () => clearInterval(t);
  }, []);
  const labels = ['Idle', 'Request →', '← Response', 'Done ✓'];
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Box label="Client" sublabel="Browser/App" color="blue" icon="💻" pulse={step === 1} />
        <Arrow label={step === 1 ? 'GET /api/data' : step === 2 ? '200 OK' : ''} animated={step === 1 || step === 2} />
        <Box label="Server" sublabel="API Server" color="cyan" icon="🖥️" pulse={step === 2} />
        <Arrow label={step === 2 ? 'query' : ''} animated={step === 2} />
        <Box label="Database" sublabel="PostgreSQL" color="purple" icon="🗄️" pulse={step === 2} />
      </div>
      <div className="text-sm text-cyan-400 font-medium h-6">{labels[step]}</div>
    </div>
  );
};

// ── Scaling Comparison ───────────────────────────────────────────────────────
export const ScalingComparisonAnimation = () => {
  const [mode, setMode] = useState('vertical');
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex gap-3">
        <button onClick={() => setMode('vertical')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'vertical' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
          Vertical Scale ↑
        </button>
        <button onClick={() => setMode('horizontal')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'horizontal' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
          Horizontal Scale →
        </button>
      </div>
      {mode === 'vertical' ? (
        <div className="flex flex-col items-center gap-2">
          <Box label="Big Server" sublabel="32 CPU, 256GB RAM" color="orange" icon="🖥️" />
          <div className="text-xs text-orange-400">⚠️ Single point of failure</div>
          <div className="text-xs text-gray-400">Max: ~$50k/month hardware</div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Box label="Load Balancer" color="cyan" icon="⚖️" />
          <div className="flex gap-3 flex-wrap justify-center">
            {['Server 1', 'Server 2', 'Server 3', 'Server N'].map((s, i) => (
              <Box key={i} label={s} sublabel="4 CPU, 16GB" color="green" icon="🖥️" />
            ))}
          </div>
          <div className="text-xs text-green-400">✓ No single point of failure</div>
        </div>
      )}
    </div>
  );
};

// ── Load Balancer Animation ──────────────────────────────────────────────────
export const LoadBalancerAnimation = () => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(s => (s + 1) % 3), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Box label="Clients" sublabel="1000s/sec" color="blue" icon="👥" />
        <Arrow label="requests" animated />
        <Box label="Load Balancer" sublabel="Round Robin" color="cyan" icon="⚖️" />
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {['Server 1', 'Server 2', 'Server 3'].map((s, i) => (
          <Box key={i} label={s} sublabel={i === active ? '← active' : 'idle'} color={i === active ? 'green' : 'gray'} icon="🖥️" pulse={i === active} />
        ))}
      </div>
      <div className="text-xs text-cyan-400">Distributing to Server {active + 1}</div>
    </div>
  );
};

// ── DB Replication Animation ─────────────────────────────────────────────────
export const DBReplicationAnimation = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 3), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Box label="App Server" color="blue" icon="🖥️" />
        <div className="flex flex-col gap-2 items-center">
          <div className="flex items-center gap-2">
            <Arrow label="WRITE" animated={step === 0} />
            <Box label="Primary DB" sublabel="Writes" color="orange" icon="🗄️" pulse={step === 0} />
          </div>
          <div className="flex items-center gap-2">
            <Arrow label="READ" animated={step === 1} />
            <Box label="Replica 1" sublabel="Reads" color="green" icon="🗄️" pulse={step === 1} />
          </div>
          <div className="flex items-center gap-2">
            <Arrow label="READ" animated={step === 2} />
            <Box label="Replica 2" sublabel="Reads" color="green" icon="🗄️" pulse={step === 2} />
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400">Primary replicates to replicas asynchronously</div>
    </div>
  );
};

// ── Cache Flow Animation ─────────────────────────────────────────────────────
export const CacheFlowAnimation = () => {
  const [scenario, setScenario] = useState('hit');
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const t = setInterval(() => setStep(s => s < 3 ? s + 1 : 0), 1000);
    return () => clearInterval(t);
  }, [scenario]);
  const hitSteps = ['Request', 'Check Cache', 'Cache HIT ✓', 'Return Data'];
  const missSteps = ['Request', 'Check Cache', 'Cache MISS ✗', 'Query DB → Cache'];
  const steps = scenario === 'hit' ? hitSteps : missSteps;
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex gap-3">
        <button onClick={() => setScenario('hit')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${scenario === 'hit' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
          Cache Hit
        </button>
        <button onClick={() => setScenario('miss')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${scenario === 'miss' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
          Cache Miss
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Box label="App" color="blue" icon="🖥️" pulse={step === 0} />
        <Arrow animated={step >= 1} />
        <Box label="Redis Cache" sublabel={scenario === 'hit' ? '✓ Found' : '✗ Not found'} color={scenario === 'hit' ? 'green' : 'red'} icon="⚡" pulse={step === 1 || step === 2} />
        {scenario === 'miss' && <><Arrow animated={step === 3} /><Box label="Database" color="purple" icon="🗄️" pulse={step === 3} /></>}
      </div>
      <div className={`text-sm font-medium h-6 ${scenario === 'hit' ? 'text-green-400' : 'text-red-400'}`}>
        {steps[step]}
      </div>
    </div>
  );
};

// ── Message Queue Animation ──────────────────────────────────────────────────
export const MessageQueueAnimation = () => {
  const [messages, setMessages] = useState([1, 2, 3]);
  const [processing, setProcessing] = useState(null);
  useEffect(() => {
    const t = setInterval(() => {
      setMessages(prev => {
        if (prev.length === 0) return [1, 2, 3, 4, 5];
        const [first, ...rest] = prev;
        setProcessing(first);
        setTimeout(() => setProcessing(null), 800);
        return rest;
      });
    }, 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Box label="Producer" sublabel="API Server" color="blue" icon="📤" />
        <Arrow label="push" animated />
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-1">Queue</div>
          <div className="flex gap-1 p-2 bg-gray-800 rounded-lg border border-gray-600 min-w-[120px] min-h-[44px] items-center">
            {messages.map(m => (
              <div key={m} className="w-8 h-8 bg-cyan-500/30 border border-cyan-500/50 rounded text-xs flex items-center justify-center text-cyan-300 font-bold">
                {m}
              </div>
            ))}
          </div>
        </div>
        <Arrow label="pull" animated />
        <Box label="Consumer" sublabel={processing ? `Processing ${processing}` : 'Waiting'} color={processing ? 'green' : 'gray'} icon="📥" pulse={!!processing} />
      </div>
      <div className="text-xs text-gray-400">{messages.length} messages in queue</div>
    </div>
  );
};

// ── URL Shortener Architecture ───────────────────────────────────────────────
export const URLShortenerAnimation = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 5), 1000);
    return () => clearInterval(t);
  }, []);
  const components = [
    { label: 'Client', icon: '💻', color: 'blue' },
    { label: 'Load Balancer', icon: '⚖️', color: 'cyan' },
    { label: 'App Servers', icon: '🖥️', color: 'green' },
    { label: 'Redis Cache', icon: '⚡', color: 'orange' },
    { label: 'Database', icon: '🗄️', color: 'purple' },
  ];
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {components.map((c, i) => (
          <React.Fragment key={i}>
            <Box label={c.label} color={c.color} icon={c.icon} pulse={i === step} />
            {i < components.length - 1 && <Arrow animated={i === step} />}
          </React.Fragment>
        ))}
      </div>
      <div className="text-xs text-cyan-400">
        {['Client sends short URL', 'LB routes request', 'App server processes', 'Cache lookup first', 'DB fallback on miss'][step]}
      </div>
    </div>
  );
};

// Animation registry
export const ANIMATIONS = {
  'client-server': ClientServerAnimation,
  'scaling-comparison': ScalingComparisonAnimation,
  'load-balancer': LoadBalancerAnimation,
  'db-replication': DBReplicationAnimation,
  'cache-flow': CacheFlowAnimation,
  'message-queue': MessageQueueAnimation,
  'url-shortener': URLShortenerAnimation,
};
