import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex gap-3">
        <button onClick={() => setMode('vertical')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'vertical' ? 'bg-cyan-500 text-white' : `${theme.bg.tertiary} ${theme.text.secondary}`}`}>
          Vertical Scale ↑
        </button>
        <button onClick={() => setMode('horizontal')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'horizontal' ? 'bg-cyan-500 text-white' : `${theme.bg.tertiary} ${theme.text.secondary}`}`}>
          Horizontal Scale →
        </button>
      </div>
      {mode === 'vertical' ? (
        <div className="flex flex-col items-center gap-2">
          <Box label="Big Server" sublabel="32 CPU, 256GB RAM" color="orange" icon="🖥️" />
          <div className="text-xs text-orange-400">⚠️ Single point of failure</div>
          <div className={`text-xs ${theme.text.secondary}`}>Max: ~$50k/month hardware</div>
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
  const { theme } = useTheme();
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
      <div className={`text-xs ${theme.text.secondary}`}>Primary replicates to replicas asynchronously</div>
    </div>
  );
};

// ── Cache Flow Animation ─────────────────────────────────────────────────────
export const CacheFlowAnimation = () => {
  const [scenario, setScenario] = useState('hit');
  const [step, setStep] = useState(0);
  const { theme } = useTheme();
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
        <button onClick={() => setScenario('hit')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${scenario === 'hit' ? 'bg-green-500 text-white' : `${theme.bg.tertiary} ${theme.text.secondary}`}`}>
          Cache Hit
        </button>
        <button onClick={() => setScenario('miss')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${scenario === 'miss' ? 'bg-red-500 text-white' : `${theme.bg.tertiary} ${theme.text.secondary}`}`}>
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
  const { theme } = useTheme();
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
          <div className={`text-xs ${theme.text.secondary} mb-1`}>Queue</div>
          <div className={`flex gap-1 p-2 ${theme.bg.tertiary} rounded-lg border ${theme.border.primary} min-w-[120px] min-h-[44px] items-center`}>
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
      <div className={`text-xs ${theme.text.secondary}`}>{messages.length} messages in queue</div>
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

// ── DNS Resolution Animation ─────────────────────────────────────────────────
export const DNSResolutionAnimation = () => {
  const [step, setStep] = useState(0);
  const { theme } = useTheme();
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 6), 1200);
    return () => clearInterval(t);
  }, []);
  const steps = [
    { label: 'Browser checks cache', active: [0] },
    { label: 'Query recursive resolver', active: [0, 1] },
    { label: 'Query root nameserver', active: [1, 2] },
    { label: 'Query TLD nameserver (.com)', active: [2, 3] },
    { label: 'Query authoritative NS', active: [3, 4] },
    { label: 'IP address returned!', active: [4, 0] },
  ];
  const nodes = [
    { label: 'Browser', color: 'blue' },
    { label: 'Resolver', color: 'cyan' },
    { label: 'Root NS', color: 'purple' },
    { label: '.com NS', color: 'orange' },
    { label: 'Auth NS', color: 'green' },
  ];
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            <Box label={n.label} color={n.color} pulse={steps[step].active.includes(i)} />
            {i < nodes.length - 1 && <Arrow animated={steps[step].active.includes(i) && steps[step].active.includes(i + 1)} />}
          </React.Fragment>
        ))}
      </div>
      <div className={`text-sm font-medium ${theme.text.primary} h-6`}>{steps[step].label}</div>
    </div>
  );
};

// ── TCP Handshake Animation ──────────────────────────────────────────────────
export const TCPHandshakeAnimation = () => {
  const [step, setStep] = useState(0);
  const { theme } = useTheme();
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 1500);
    return () => clearInterval(t);
  }, []);
  const messages = ['Idle', 'SYN →', '← SYN-ACK', 'ACK → Connected!'];
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <Box label="Client" color="blue" pulse={step === 1 || step === 3} />
        <div className="flex flex-col items-center min-w-[120px]">
          {step >= 1 && <div className="text-xs text-cyan-400 mb-1">SYN →</div>}
          {step >= 2 && <div className="text-xs text-green-400 mb-1">← SYN-ACK</div>}
          {step >= 3 && <div className="text-xs text-purple-400">ACK →</div>}
        </div>
        <Box label="Server" color="cyan" pulse={step === 2} />
      </div>
      <div className={`text-sm font-medium h-6 ${step === 3 ? 'text-green-400' : theme.text.primary}`}>{messages[step]}</div>
    </div>
  );
};

// ── HTTP Request/Response Animation ──────────────────────────────────────────
export const HTTPRequestAnimation = () => {
  const [step, setStep] = useState(0);
  const { theme } = useTheme();
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 5), 1000);
    return () => clearInterval(t);
  }, []);
  const labels = [
    'User types URL',
    'DNS resolves → 142.250.80.46',
    'TCP + TLS handshake',
    'GET /api/users HTTP/1.1',
    '200 OK { "users": [...] }',
  ];
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Box label="Browser" color="blue" pulse={step <= 1} />
        <Arrow label={step === 1 ? 'DNS' : step === 2 ? 'TCP/TLS' : step === 3 ? 'GET' : step === 4 ? '200 OK' : ''} animated={step >= 1} />
        <Box label="Server" color="cyan" pulse={step >= 3} />
      </div>
      <div className={`text-sm font-medium h-6 ${step === 4 ? 'text-green-400' : theme.text.primary}`}>{labels[step]}</div>
    </div>
  );
};

// ── OSI Layers Animation ─────────────────────────────────────────────────────
export const OSILayersAnimation = () => {
  const [activeLayer, setActiveLayer] = useState(null);
  const { theme } = useTheme();
  const layers = [
    { num: 7, name: 'Application', examples: 'HTTP, DNS, WebSocket', color: 'purple' },
    { num: 4, name: 'Transport', examples: 'TCP, UDP', color: 'cyan' },
    { num: 3, name: 'Network', examples: 'IP, Routing', color: 'blue' },
    { num: 1, name: 'Physical', examples: 'Cables, WiFi, Fiber', color: 'gray' },
  ];
  return (
    <div className="flex flex-col items-center gap-1 py-4">
      <div className={`text-xs ${theme.text.muted} mb-2`}>Click a layer to learn more</div>
      {layers.map((l) => (
        <button key={l.num} onClick={() => setActiveLayer(activeLayer === l.num ? null : l.num)}
          className={`w-full max-w-sm px-4 py-3 rounded-lg border text-center transition-all ${
            activeLayer === l.num
              ? `bg-${l.color}-500/20 border-${l.color}-500/50 scale-105`
              : `${theme.bg.secondary} ${theme.border.primary} hover:border-${l.color}-500/30`
          }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold text-${l.color}-400`}>L{l.num}</span>
            <span className={`text-sm font-semibold ${theme.text.primary}`}>{l.name}</span>
            <span className={`text-xs ${theme.text.muted}`}>{l.examples}</span>
          </div>
          {activeLayer === l.num && (
            <div className={`text-xs ${theme.text.secondary} mt-2 text-left`}>
              {l.num === 7 && 'Your application code lives here. HTTP requests, DNS lookups, WebSocket messages — all Layer 7. L7 load balancers can inspect these.'}
              {l.num === 4 && 'TCP provides reliable delivery. UDP provides speed. L4 load balancers route based on IP/port without reading HTTP content.'}
              {l.num === 3 && 'IP addresses and routing. Packets hop through routers to reach their destination. Public vs private IPs live here.'}
              {l.num === 1 && 'The physical medium — electrical signals on copper, light pulses in fiber, radio waves for WiFi. You rarely think about this in system design.'}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

// ── Load Balancer L4 vs L7 Animation ─────────────────────────────────────────
export const LoadBalancerTypesAnimation = () => {
  const [mode, setMode] = useState('l7');
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex gap-3">
        <button onClick={() => setMode('l7')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'l7' ? 'bg-cyan-500 text-white' : `${theme.bg.secondary} ${theme.text.secondary}`}`}>
          Layer 7 (HTTP)
        </button>
        <button onClick={() => setMode('l4')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'l4' ? 'bg-purple-500 text-white' : `${theme.bg.secondary} ${theme.text.secondary}`}`}>
          Layer 4 (TCP)
        </button>
      </div>
      <div className="flex items-start gap-2 flex-wrap justify-center">
        <Box label="Client" color="blue" />
        <Arrow label={mode === 'l7' ? 'HTTP' : 'TCP'} animated />
        <div className="flex flex-col items-center gap-1">
          <Box label={mode === 'l7' ? 'L7 LB' : 'L4 LB'} sublabel={mode === 'l7' ? 'Reads HTTP' : 'TCP only'} color={mode === 'l7' ? 'cyan' : 'purple'} />
          <div className={`text-[10px] ${theme.text.muted} max-w-[140px] text-center`}>
            {mode === 'l7' ? 'Routes by URL, headers, cookies' : 'Routes by IP/port only'}
          </div>
        </div>
        <Arrow animated />
        <div className="flex flex-col gap-2">
          <Box label="/api → API" color="green" />
          <Box label="/web → Web" color="orange" />
        </div>
      </div>
      <div className={`text-xs ${theme.text.secondary} max-w-md text-center`}>
        {mode === 'l7'
          ? 'L7 load balancers terminate the client connection and create new ones to backends. They can route /api to API servers and /static to CDN. Best for HTTP traffic.'
          : 'L4 load balancers pass TCP connections through without inspecting content. The client has a direct TCP connection to the backend. Best for WebSockets and persistent connections.'}
      </div>
    </div>
  );
};

// ── VPC / Network Architecture Animation ─────────────────────────────────────
export const VPCArchitectureAnimation = () => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className={`text-xs font-semibold text-red-400 uppercase tracking-wider`}>Public Internet</div>
      <Box label="Users" color="blue" />
      <Arrow label="HTTPS" animated />
      <div className={`border-2 border-dashed border-cyan-500/30 rounded-xl p-4 w-full max-w-lg`}>
        <div className={`text-xs font-semibold text-cyan-400 mb-3 text-center`}>VPC (Private Network)</div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Box label="Load Balancer" sublabel="Public IP" color="cyan" />
          </div>
          <Arrow animated />
          <div className="flex gap-2 flex-wrap justify-center">
            <Box label="App Server 1" sublabel="10.0.1.x" color="green" />
            <Box label="App Server 2" sublabel="10.0.1.x" color="green" />
          </div>
          <Arrow animated />
          <div className="flex gap-2 flex-wrap justify-center">
            <Box label="Database" sublabel="10.0.2.x" color="purple" />
            <Box label="Redis" sublabel="10.0.2.x" color="orange" />
          </div>
        </div>
      </div>
      <div className={`text-xs ${theme.text.muted} text-center max-w-sm`}>
        Only the load balancer has a public IP. App servers and databases use private IPs and are not accessible from the internet.
      </div>
    </div>
  );
};

// ── Circuit Breaker Animation ────────────────────────────────────────────────
export const CircuitBreakerAnimation = () => {
  const [state, setState] = useState('closed');
  const [failures, setFailures] = useState(0);
  const { theme } = useTheme();

  const simulateRequest = () => {
    if (state === 'open') {
      // After cooldown, try half-open
      setState('half-open');
      return;
    }
    if (state === 'half-open') {
      // Test request — 50% chance of success
      if (Math.random() > 0.5) {
        setState('closed');
        setFailures(0);
      } else {
        setState('open');
      }
      return;
    }
    // Closed state — simulate failure
    const newFailures = failures + 1;
    setFailures(newFailures);
    if (newFailures >= 3) {
      setState('open');
    }
  };

  const stateColors = { closed: 'text-green-400', open: 'text-red-400', 'half-open': 'text-yellow-400' };
  const stateBg = { closed: 'bg-green-500/20 border-green-500/40', open: 'bg-red-500/20 border-red-500/40', 'half-open': 'bg-yellow-500/20 border-yellow-500/40' };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className={`px-6 py-4 rounded-xl border ${stateBg[state]} text-center min-w-[200px]`}>
        <div className={`text-lg font-bold ${stateColors[state]} uppercase`}>{state}</div>
        <div className={`text-xs ${theme.text.muted} mt-1`}>
          {state === 'closed' && `Failures: ${failures}/3`}
          {state === 'open' && 'All requests fail fast'}
          {state === 'half-open' && 'Testing with one request...'}
        </div>
      </div>
      <button onClick={simulateRequest}
        className={`px-4 py-2 rounded-lg text-sm font-medium bg-cyan-500 text-white hover:bg-cyan-600 transition-all`}>
        {state === 'open' ? 'Try Recovery' : state === 'half-open' ? 'Send Test Request' : 'Simulate Failure'}
      </button>
      <button onClick={() => { setState('closed'); setFailures(0); }}
        className={`text-xs ${theme.text.muted} hover:text-cyan-400 transition-colors`}>
        Reset
      </button>
      <div className={`text-xs ${theme.text.secondary} max-w-sm text-center`}>
        {state === 'closed' && 'Circuit is closed — requests flow normally. After 3 failures, it trips open.'}
        {state === 'open' && 'Circuit is open — all requests immediately fail without calling the dependency. Click "Try Recovery" to enter half-open state.'}
        {state === 'half-open' && 'Circuit is half-open — one test request is allowed through. If it succeeds, circuit closes. If it fails, circuit stays open.'}
      </div>
    </div>
  );
};

// ── REST Request Flow Animation ──────────────────────────────────────────────
const RESTRequestFlowAnimation = () => {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'Client', detail: 'PATCH /users/42', color: 'blue' },
    { label: 'Auth Middleware', detail: 'Verify JWT token', color: 'yellow' },
    { label: 'Rate Limiter', detail: 'Check: 73/100 remaining', color: 'orange' },
    { label: 'Router', detail: 'Match → UsersController.update', color: 'purple' },
    { label: 'Validation', detail: 'Validate body schema', color: 'cyan' },
    { label: 'Business Logic', detail: 'Update user in DB', color: 'green' },
    { label: 'Response', detail: '200 OK + updated user JSON', color: 'green' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % steps.length), 1500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`w-full max-w-xs px-4 py-3 rounded-lg border transition-all duration-500 ${
            i === step
              ? `bg-${s.color}-500/20 border-${s.color}-500/50 scale-105`
              : i < step
                ? `${theme.bg.secondary} ${theme.border.primary} opacity-50`
                : `${theme.bg.secondary} ${theme.border.primary} opacity-30`
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${i === step ? `text-${s.color}-400` : theme.text.secondary}`}>{s.label}</span>
              <span className={`text-xs font-mono ${i === step ? `text-${s.color}-300` : theme.text.muted}`}>{s.detail}</span>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className={`text-xs transition-all duration-300 ${i < step ? 'text-green-400' : theme.text.muted}`}>
              {i < step ? '✓' : '↓'}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── GraphQL vs REST Comparison Animation ─────────────────────────────────────
const GraphQLvsRESTAnimation = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState('rest');
  const [restStep, setRestStep] = useState(0);
  const [gqlDone, setGqlDone] = useState(false);

  const restCalls = [
    { endpoint: 'GET /users/42', data: '{ id, name, email, bio, avatar, ... }', label: 'User profile (30 fields)' },
    { endpoint: 'GET /users/42/posts?limit=5', data: '{ posts: [{ id, title, body, ... }] }', label: 'User posts' },
    { endpoint: 'GET /users/42/followers/count', data: '{ count: 1284 }', label: 'Follower count' },
  ];

  useEffect(() => {
    if (mode === 'rest') {
      setRestStep(0);
      setGqlDone(false);
      const timer = setInterval(() => setRestStep(s => { if (s < 2) return s + 1; clearInterval(timer); return s; }), 1200);
      return () => clearInterval(timer);
    } else {
      setRestStep(0);
      setGqlDone(false);
      const timer = setTimeout(() => setGqlDone(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  return (
    <div className="py-4">
      <div className="flex justify-center gap-2 mb-6">
        <button onClick={() => setMode('rest')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'rest' ? 'bg-blue-500 text-white' : `${theme.bg.secondary} ${theme.text.secondary}`}`}>REST</button>
        <button onClick={() => setMode('graphql')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'graphql' ? 'bg-purple-500 text-white' : `${theme.bg.secondary} ${theme.text.secondary}`}`}>GraphQL</button>
      </div>

      {mode === 'rest' ? (
        <div className="space-y-3 max-w-md mx-auto">
          <div className={`text-xs text-center ${theme.text.muted} mb-2`}>3 separate requests needed</div>
          {restCalls.map((call, i) => (
            <div key={i} className={`px-4 py-3 rounded-lg border transition-all duration-500 ${
              i <= restStep ? 'bg-blue-500/15 border-blue-500/40' : `${theme.bg.secondary} ${theme.border.primary} opacity-30`
            }`}>
              <div className="flex items-center justify-between">
                <code className={`text-xs font-mono ${i <= restStep ? 'text-blue-400' : theme.text.muted}`}>{call.endpoint}</code>
                {i <= restStep && <span className="text-green-400 text-xs">✓</span>}
              </div>
              <div className={`text-[10px] mt-1 ${theme.text.muted}`}>{call.label}</div>
            </div>
          ))}
          <div className={`text-center text-xs ${theme.text.muted} mt-3`}>
            {restStep >= 2 ? '~150ms total (3 round trips)' : `Request ${restStep + 1} of 3...`}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div className={`text-xs text-center ${theme.text.muted} mb-2`}>1 request, exact data needed</div>
          <div className={`px-4 py-3 rounded-lg border transition-all duration-500 ${gqlDone ? 'bg-purple-500/15 border-purple-500/40' : `${theme.bg.secondary} ${theme.border.primary}`}`}>
            <code className={`text-xs font-mono block ${gqlDone ? 'text-purple-400' : theme.text.muted}`}>
              {'POST /graphql'}
            </code>
            <pre className={`text-[10px] mt-2 font-mono ${theme.text.secondary}`}>{`query {
  user(id: "42") {
    name, avatar
    posts(limit: 5) { title }
    followersCount
  }
}`}</pre>
            {gqlDone && <div className="flex items-center gap-1 mt-2"><span className="text-green-400 text-xs">✓</span><span className={`text-[10px] ${theme.text.muted}`}>Only requested fields returned</span></div>}
          </div>
          <div className={`text-center text-xs ${theme.text.muted} mt-3`}>
            {gqlDone ? '~50ms total (1 round trip, no over-fetching)' : 'Sending query...'}
          </div>
        </div>
      )}
    </div>
  );
};

// Animation registry
export const ANIMATIONS = {
  'client-server': ClientServerAnimation,
  'scaling-comparison': ScalingComparisonAnimation,
  'dns-resolution': DNSResolutionAnimation,
  'tcp-handshake': TCPHandshakeAnimation,
  'http-request': HTTPRequestAnimation,
  'osi-layers': OSILayersAnimation,
  'load-balancer-types': LoadBalancerTypesAnimation,
  'vpc-architecture': VPCArchitectureAnimation,
  'circuit-breaker': CircuitBreakerAnimation,
  'load-balancer': LoadBalancerAnimation,
  'db-replication': DBReplicationAnimation,
  'cache-flow': CacheFlowAnimation,
  'message-queue': MessageQueueAnimation,
  'url-shortener': URLShortenerAnimation,
  'rest-request-flow': RESTRequestFlowAnimation,
  'graphql-vs-rest': GraphQLvsRESTAnimation,
};
