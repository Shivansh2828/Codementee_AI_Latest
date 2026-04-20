import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, ChevronRight, BookOpen, Lightbulb, AlertTriangle, Info, Menu, X, CheckCircle, XCircle, Code2, Layers, Zap, Lock, Crown } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { getTopicBySlug, getNextTopic, getPrevTopic, TOPICS, SECTIONS, getTopicAccess } from '../../data/systemDesignCourse';
import { ANIMATIONS } from '../../components/learn/CourseAnimations';
import ArchitectureDiagram from '../../components/learn/ArchitectureDiagram';
import { useAuth } from '../../contexts/AuthContext';

// ── Rich text renderer ───────────────────────────────────────────────────────
const RichText = ({ text, theme }) => {
  if (!text) return null;
  const fenceParts = text.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {fenceParts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^\w+\n/, '');
          return (
            <pre key={i} className={`bg-[var(--code-bg)] text-[var(--code-text)] rounded-xl p-4 text-sm font-mono overflow-x-auto my-4 border border-[var(--border-primary)] leading-relaxed`}>
              {code.trim()}
            </pre>
          );
        }
        // Inline bold, links + newlines
        const lines = part.split('\n');
        return (
          <span key={i}>
            {lines.map((line, li) => {
              // Split on bold (**text**) and links ([text](url))
              const tokens = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
              return (
                <span key={li}>
                  {tokens.map((tok, ti) => {
                    if (tok.startsWith('**') && tok.endsWith('**')) {
                      return <strong key={ti} className={`${theme.text.primary} font-semibold`}>{tok.slice(2, -2)}</strong>;
                    }
                    const linkMatch = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                    if (linkMatch) {
                      const isExternal = linkMatch[2].startsWith('http');
                      return <a key={ti} href={linkMatch[2]} className="text-blue-500 hover:text-blue-400 hover:underline" {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{linkMatch[1]}</a>;
                    }
                    return <span key={ti}>{tok}</span>;
                  })}
                  {li < lines.length - 1 && <br />}
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
};

// ── Theme-aware color helper ─────────────────────────────────────────────────
// Uses CSS custom properties defined in index.css. Colors swap automatically with .dark class.
const COLOR_MAP = {
  blue:   { text: 'text-[var(--blue)]',   bg: 'bg-[var(--blue-bg)]',   border: 'border-[var(--blue-border)]',   bgStrong: 'bg-[var(--blue-bg)]' },
  green:  { text: 'text-[var(--green)]',  bg: 'bg-[var(--green-bg)]',  border: 'border-[var(--green-border)]',  bgStrong: 'bg-[var(--green-bg)]' },
  red:    { text: 'text-[var(--red)]',    bg: 'bg-[var(--red-bg)]',    border: 'border-[var(--red-border)]',    bgStrong: 'bg-[var(--red-bg)]' },
  yellow: { text: 'text-[var(--yellow)]', bg: 'bg-[var(--yellow-bg)]', border: 'border-[var(--yellow-border)]', bgStrong: 'bg-[var(--yellow-bg)]' },
  purple: { text: 'text-[var(--purple)]', bg: 'bg-[var(--purple-bg)]', border: 'border-[var(--purple-border)]', bgStrong: 'bg-[var(--purple-bg)]' },
  cyan:   { text: 'text-[var(--cyan)]',   bg: 'bg-[var(--cyan-bg)]',   border: 'border-[var(--cyan-border)]',   bgStrong: 'bg-[var(--cyan-bg)]' },
  orange: { text: 'text-[var(--orange)]', bg: 'bg-[var(--orange-bg)]', border: 'border-[var(--orange-border)]', bgStrong: 'bg-[var(--orange-bg)]' },
  pink:   { text: 'text-[var(--pink)]',   bg: 'bg-[var(--pink-bg)]',   border: 'border-[var(--pink-border)]',   bgStrong: 'bg-[var(--pink-bg)]' },
};
const c = (color) => COLOR_MAP[color] || COLOR_MAP.blue;

const calloutStyles = {
  tip:     { bg: 'bg-[var(--success-bg)] border-[var(--success-border)]', label: '💡 Tip',       labelColor: 'text-[var(--success)]' },
  warning: { bg: 'bg-[var(--warning-bg)] border-[var(--warning-border)]', label: '⚠️ Watch Out', labelColor: 'text-[var(--warning)]' },
  info:    { bg: 'bg-[var(--info-bg)] border-[var(--info-border)]',       label: 'ℹ️ Note',      labelColor: 'text-[var(--info)]' },
  example: { bg: 'bg-[var(--purple-bg)] border-[var(--purple-border)]',   label: '📌 Example',   labelColor: 'text-[var(--purple)]' },
};

// ── Diagram component (static visual diagrams) ──────────────────────────────
const DiagramSection = ({ section, theme }) => {
  return (
    <div className={`mb-8 ${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
      {section.heading && (
        <div className={`px-6 py-3 border-b ${theme.border.primary}`}>
          <h3 className={`font-semibold ${theme.text.primary}`}>{section.heading}</h3>
          {section.caption && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.caption}</p>}
        </div>
      )}
      <div className="p-6">
        {section.variant === 'osi-layers' && (
          <div className="flex flex-col items-center gap-1.5 max-w-md mx-auto">
            {[
              { num: 7, name: 'Application Layer', examples: 'HTTP, DNS, WS, gRPC', color: 'blue', important: true },
              { num: 6, name: 'Presentation Layer', examples: 'SSL/TLS, Encryption', color: null },
              { num: 5, name: 'Session Layer', examples: 'Session mgmt', color: null },
              { num: 4, name: 'Transport Layer', examples: 'TCP, UDP, QUIC', color: 'green', important: true },
              { num: 3, name: 'Network Layer', examples: 'IP, Routing', color: 'pink', important: true },
              { num: 2, name: 'Data Link Layer', examples: 'Ethernet, MAC', color: null },
              { num: 1, name: 'Physical Layer', examples: 'Cables, WiFi, Fiber', color: null },
            ].map((l) => (
              <div key={l.num} className={`w-full border rounded-lg px-4 py-2.5 flex items-center justify-between ${
                l.color
                  ? `${c(l.color).bg} ${c(l.color).border} ${c(l.color).text} ${l.important ? 'ring-1 ring-offset-1 ring-offset-transparent' : ''}`
                  : `${theme.bg.secondary} ${theme.border.primary} ${theme.text.muted}`
              }`}
                style={{ maxWidth: `${280 + (7 - l.num) * 25}px` }}>
                <span className="text-sm font-bold">{l.name} ({l.num})</span>
                <span className="text-xs opacity-70">{l.examples}</span>
              </div>
            ))}
            <div className={`mt-3 text-xs ${theme.text.muted} text-center`}>
              Colored layers are the ones that matter most for system design interviews
            </div>
          </div>
        )}

        {section.variant === 'url-journey' && (
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            {[
              { step: '1', label: 'Browser', action: 'User types URL', color: 'blue' },
              { step: '2', label: 'DNS', action: 'Resolve domain → IP address', color: 'purple' },
              { step: '3', label: 'TCP', action: '3-way handshake (SYN → SYN-ACK → ACK)', color: 'cyan' },
              { step: '4', label: 'TLS', action: 'Encrypt connection (HTTPS)', color: 'green' },
              { step: '5', label: 'HTTP', action: 'Send GET request with headers', color: 'orange' },
              { step: '6', label: 'Server', action: 'Process request, query DB, build response', color: 'red' },
              { step: '7', label: 'Response', action: '200 OK + HTML/JSON body', color: 'green' },
              { step: '8', label: 'Render', action: 'Parse HTML, fetch CSS/JS/images, paint page', color: 'blue' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${c(s.color).bg} border ${c(s.color).border} flex items-center justify-center shrink-0`}>
                  <span className={`text-xs font-bold ${c(s.color).text}`}>{s.step}</span>
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-semibold ${c(s.color).text}`}>{s.label}</span>
                  <span className={`text-sm ${theme.text.secondary} ml-2`}>{s.action}</span>
                </div>
                {i < 7 && <div className={`text-xs ${theme.text.muted}`}>↓</div>}
              </div>
            ))}
          </div>
        )}

        {section.variant === 'scaling-types' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className={`${theme.bg.secondary} rounded-xl p-5 border ${theme.border.primary}`}>
              <div className="text-center mb-3">
                <span className="text-2xl">⬆️</span>
                <h4 className={`font-bold ${c('orange').text} mt-1`}>Vertical Scaling</h4>
                <p className={`text-xs ${theme.text.muted}`}>Scale Up — Bigger machine</p>
              </div>
              <div className="flex flex-col items-center gap-2 mb-3">
                <div className={`w-16 h-16 ${c('orange').bg} border ${c('orange').border} rounded-lg flex items-center justify-center`}>
                  <span className={`text-xs font-bold ${c('orange').text}`}>64 CPU<br/>512GB</span>
                </div>
              </div>
              <div className={`text-xs ${theme.text.secondary} space-y-1`}>
                <p>✅ Simple — no code changes</p>
                <p>✅ No distributed complexity</p>
                <p>❌ Hardware limits (ceiling)</p>
                <p>❌ Single point of failure</p>
                <p>❌ Expensive at high end</p>
              </div>
            </div>
            <div className={`${theme.bg.secondary} rounded-xl p-5 border ${theme.border.primary}`}>
              <div className="text-center mb-3">
                <span className="text-2xl">➡️</span>
                <h4 className={`font-bold ${c('green').text} mt-1`}>Horizontal Scaling</h4>
                <p className={`text-xs ${theme.text.muted}`}>Scale Out — More machines</p>
              </div>
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1,2,3,4].map(n => (
                  <div key={n} className={`w-10 h-10 ${c('green').bg} border ${c('green').border} rounded flex items-center justify-center`}>
                    <span className={`text-[9px] font-bold ${c('green').text}`}>4CPU</span>
                  </div>
                ))}
              </div>
              <div className={`text-xs ${theme.text.secondary} space-y-1`}>
                <p>✅ Theoretically unlimited</p>
                <p>✅ No single point of failure</p>
                <p>✅ Cost-effective (commodity HW)</p>
                <p>❌ Requires load balancing</p>
                <p>❌ Distributed system complexity</p>
              </div>
            </div>
          </div>
        )}

        {section.variant === 'lb-algorithms' && (
          <div className="max-w-lg mx-auto">
            <div className="space-y-3">
              {[
                { name: 'Round Robin', desc: 'Requests go to servers in rotation: 1 → 2 → 3 → 1 → 2 → 3', best: 'Stateless services, equal server capacity', visual: '①→②→③→①→②→③' },
                { name: 'Least Connections', desc: 'Route to the server with fewest active connections', best: 'WebSockets, long-lived connections, uneven request durations', visual: '①(2) ②(5) ③(1) → pick ③' },
                { name: 'IP Hash', desc: 'Hash client IP to always route same client to same server', best: 'Session affinity, sticky sessions', visual: 'hash(IP) % N → always same server' },
                { name: 'Weighted Round Robin', desc: 'Servers with more capacity get proportionally more requests', best: 'Mixed hardware (some servers are bigger)', visual: '①①①→②②→③ (3:2:1 ratio)' },
                { name: 'Random', desc: 'Pick a random server for each request', best: 'Surprisingly effective at scale, simple', visual: 'random(1,2,3) each time' },
              ].map((alg, i) => (
                <div key={i} className={`${theme.bg.secondary} rounded-lg p-4 border ${theme.border.primary}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${theme.text.primary}`}>{alg.name}</span>
                    <code className={`text-[10px] font-mono ${theme.text.muted}`}>{alg.visual}</code>
                  </div>
                  <p className={`text-xs ${theme.text.secondary} mb-1`}>{alg.desc}</p>
                  <p className="text-[10px] text-[var(--cyan)]">Best for: {alg.best}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {section.variant === 'status-code-tree' && (
          <div className="max-w-lg mx-auto">
            <div className="space-y-2">
              {[
                { code: '200', label: 'OK', when: 'GET/PUT/PATCH/DELETE succeeded', color: 'green' },
                { code: '201', label: 'Created', when: 'POST created a new resource', color: 'green' },
                { code: '204', label: 'No Content', when: 'DELETE succeeded, nothing to return', color: 'green' },
                { code: '400', label: 'Bad Request', when: 'Invalid input, missing fields, wrong types', color: 'yellow' },
                { code: '401', label: 'Unauthorized', when: 'No auth token or token is invalid', color: 'red' },
                { code: '403', label: 'Forbidden', when: 'Authenticated but lacks permission', color: 'red' },
                { code: '404', label: 'Not Found', when: 'Resource does not exist', color: 'yellow' },
                { code: '409', label: 'Conflict', when: 'Duplicate creation, state conflict', color: 'orange' },
                { code: '429', label: 'Too Many Requests', when: 'Rate limit exceeded', color: 'orange' },
                { code: '500', label: 'Internal Error', when: 'Server bug — client did nothing wrong', color: 'red' },
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${theme.bg.secondary} border ${theme.border.primary}`}>
                  <span className={`text-sm font-bold font-mono w-10 ${c(s.color).text}`}>{s.code}</span>
                  <span className={`text-sm font-semibold ${theme.text.primary} w-32 shrink-0`}>{s.label}</span>
                  <span className={`text-xs ${theme.text.muted} flex-1`}>{s.when}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {section.variant === 'api-paradigms-comparison' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {[
              { name: 'REST', format: 'JSON', transport: 'HTTP/1.1', style: 'Resource-based', perf: 'Good', browser: '✅ Native', debug: '✅ Easy (curl)', best: 'Public APIs, CRUD, web apps', color: 'blue' },
              { name: 'GraphQL', format: 'JSON', transport: 'HTTP', style: 'Query-based', perf: 'Good', browser: '✅ Native', debug: '⚠️ Moderate', best: 'Complex UIs, mobile, multi-client', color: 'purple' },
              { name: 'gRPC', format: 'Protobuf (binary)', transport: 'HTTP/2', style: 'RPC (function calls)', perf: '5-10x faster', browser: '❌ Needs proxy', debug: '❌ Hard', best: 'Internal microservices, streaming', color: 'orange' },
            ].map((p, i) => (
              <div key={i} className={`${theme.bg.secondary} rounded-xl p-4 border ${theme.border.primary}`}>
                <h4 className={`font-bold ${c(p.color).text} text-center mb-3`}>{p.name}</h4>
                <div className={`space-y-2 text-xs ${theme.text.secondary}`}>
                  <div><span className={`${theme.text.muted}`}>Format:</span> {p.format}</div>
                  <div><span className={`${theme.text.muted}`}>Transport:</span> {p.transport}</div>
                  <div><span className={`${theme.text.muted}`}>Style:</span> {p.style}</div>
                  <div><span className={`${theme.text.muted}`}>Performance:</span> {p.perf}</div>
                  <div><span className={`${theme.text.muted}`}>Browser:</span> {p.browser}</div>
                  <div><span className={`${theme.text.muted}`}>Debugging:</span> {p.debug}</div>
                  <div className={`pt-2 border-t ${theme.border.primary} ${c(p.color).text} font-medium`}>Best for: {p.best}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {section.variant === 'pagination-types' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className={`${theme.bg.secondary} rounded-xl p-5 border ${theme.border.primary}`}>
              <h4 className={`font-bold ${c('blue').text} text-center mb-3`}>Offset Pagination</h4>
              <div className="flex flex-col items-center gap-2 mb-3">
                <code className={`text-xs font-mono ${theme.text.muted}`}>GET /users?page=3&limit=20</code>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold ${n === 3 ? `${c('blue').bgStrong} border ${c('blue').border} ${c('blue').text}` : `${theme.bg.primary} ${theme.border.primary} border ${theme.text.muted}`}`}>
                      P{n}
                    </div>
                  ))}
                </div>
              </div>
              <div className={`text-xs ${theme.text.secondary} space-y-1`}>
                <p>✅ Simple, jump to any page</p>
                <p>✅ Easy to implement</p>
                <p>❌ Slow at large offsets</p>
                <p>❌ Inconsistent with inserts/deletes</p>
              </div>
            </div>
            <div className={`${theme.bg.secondary} rounded-xl p-5 border ${theme.border.primary}`}>
              <h4 className={`font-bold ${c('green').text} text-center mb-3`}>Cursor Pagination</h4>
              <div className="flex flex-col items-center gap-2 mb-3">
                <code className={`text-xs font-mono ${theme.text.muted}`}>GET /users?after=eyJ...&limit=20</code>
                <div className="flex items-center gap-1">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] ${theme.bg.primary} ${theme.border.primary} border ${theme.text.muted} opacity-40`}>...</div>
                  <div className={`${c('green').text} text-xs`}>→</div>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold ${c('green').bgStrong} border ${c('green').border} ${c('green').text}`}>42</div>
                  <div className={`${c('green').text} text-xs`}>→</div>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] ${theme.bg.primary} ${theme.border.primary} border ${theme.text.muted} opacity-40`}>...</div>
                </div>
              </div>
              <div className={`text-xs ${theme.text.secondary} space-y-1`}>
                <p>✅ Consistent performance (O(1))</p>
                <p>✅ No duplicates or gaps</p>
                <p>✅ Works with infinite scroll</p>
                <p>❌ Cannot jump to arbitrary page</p>
              </div>
            </div>
          </div>
        )}

        {section.variant === 'jwt-auth-flow' && (
          <div className="flex flex-col gap-3 max-w-lg mx-auto">
            {[
              { step: '1', label: 'Login', action: 'POST /auth/login { email, password }', color: 'blue' },
              { step: '2', label: 'Verify', action: 'Server validates credentials against DB', color: 'purple' },
              { step: '3', label: 'Sign JWT', action: 'Create token: { userId, role, exp } + secret', color: 'cyan' },
              { step: '4', label: 'Return', action: '200 OK { access_token, refresh_token }', color: 'green' },
              { step: '5', label: 'API Call', action: 'GET /users/me — Authorization: Bearer eyJ...', color: 'orange' },
              { step: '6', label: 'Validate', action: 'Verify signature + check expiration (no DB hit)', color: 'yellow' },
              { step: '7', label: 'Respond', action: '200 OK { id, name, email, role }', color: 'green' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${c(s.color).bg} border ${c(s.color).border} flex items-center justify-center shrink-0`}>
                  <span className={`text-xs font-bold ${c(s.color).text}`}>{s.step}</span>
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-semibold ${c(s.color).text}`}>{s.label}</span>
                  <span className={`text-sm ${theme.text.secondary} ml-2`}>{s.action}</span>
                </div>
                {i < 6 && <div className={`text-xs ${theme.text.muted}`}>↓</div>}
              </div>
            ))}
          </div>
        )}

        {section.variant === 'db-types-comparison' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {[
              { name: 'Relational (SQL)', examples: 'PostgreSQL, MySQL', model: 'Tables with rows & columns', best: 'Transactions, JOINs, complex queries', scale: 'Vertical + read replicas', color: 'blue' },
              { name: 'Document', examples: 'MongoDB, Firestore', model: 'JSON-like documents', best: 'Flexible schema, hierarchical data', scale: 'Horizontal (sharding)', color: 'green' },
              { name: 'Key-Value', examples: 'Redis, DynamoDB', model: 'Key → Value pairs', best: 'Caching, sessions, simple lookups', scale: 'Horizontal, sub-ms latency', color: 'orange' },
              { name: 'Wide-Column', examples: 'Cassandra, HBase', model: 'Rows with dynamic columns', best: 'Time-series, massive writes', scale: 'Horizontal, multi-region', color: 'purple' },
              { name: 'Graph', examples: 'Neo4j, Neptune', model: 'Nodes & edges', best: 'Social graphs, recommendations', scale: 'Relationship traversals O(1)', color: 'pink' },
              { name: 'Search Engine', examples: 'Elasticsearch, Solr', model: 'Inverted index', best: 'Full-text search, log analytics', scale: 'Horizontal, near real-time', color: 'cyan' },
            ].map((db, i) => (
              <div key={i} className={`${theme.bg.secondary} rounded-xl p-4 border ${theme.border.primary}`}>
                <h4 className={`font-bold text-[var(--${db.color})] text-sm mb-2`}>{db.name}</h4>
                <div className={`space-y-1.5 text-xs ${theme.text.secondary}`}>
                  <div><span className={theme.text.muted}>Examples:</span> {db.examples}</div>
                  <div><span className={theme.text.muted}>Model:</span> {db.model}</div>
                  <div><span className={theme.text.muted}>Best for:</span> {db.best}</div>
                  <div className={`pt-1.5 border-t border-[var(--border-primary)] text-[var(--${db.color})]`}>{db.scale}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {section.variant === 'sql-vs-nosql' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className={`${theme.bg.secondary} rounded-xl p-5 border ${theme.border.primary}`}>
              <h4 className="font-bold text-[var(--blue)] text-center mb-3">Choose SQL When</h4>
              <div className={`text-xs ${theme.text.secondary} space-y-2`}>
                <p>✅ Data has strong relationships (users → orders → items)</p>
                <p>✅ You need ACID transactions (payments, inventory)</p>
                <p>✅ Complex queries with JOINs, aggregations, GROUP BY</p>
                <p>✅ Ad-hoc querying and reporting</p>
                <p>✅ Schema is well-defined and stable</p>
                <p className={`pt-2 border-t border-[var(--border-primary)] ${theme.text.muted} italic`}>Default: PostgreSQL</p>
              </div>
            </div>
            <div className={`${theme.bg.secondary} rounded-xl p-5 border ${theme.border.primary}`}>
              <h4 className="font-bold text-[var(--green)] text-center mb-3">Choose NoSQL When</h4>
              <div className={`text-xs ${theme.text.secondary} space-y-2`}>
                <p>✅ Need horizontal write scalability (millions/sec)</p>
                <p>✅ Data is naturally document-shaped (nested JSON)</p>
                <p>✅ Simple access patterns (key-value lookups)</p>
                <p>✅ Schema evolves frequently</p>
                <p>✅ Eventual consistency is acceptable</p>
                <p className={`pt-2 border-t border-[var(--border-primary)] ${theme.text.muted} italic`}>Default: MongoDB (docs) or Redis (KV)</p>
              </div>
            </div>
          </div>
        )}

        {section.variant === 'bloom-filter' && (
          <div className="max-w-lg mx-auto">
            <div className="mb-4">
              <div className={`text-xs ${theme.text.muted} text-center mb-2`}>Bit Array (m = 16 bits)</div>
              <div className="flex justify-center gap-0.5">
                {[0,1,0,1,1,0,0,1,0,0,1,0,1,0,0,1].map((bit, i) => (
                  <div key={i} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono font-bold border ${
                    bit ? 'bg-[var(--cyan-bg)] border-[var(--cyan-border)] text-[var(--cyan)]' : `${theme.bg.secondary} ${theme.border.primary} ${theme.text.muted}`
                  }`}>{bit}</div>
                ))}
              </div>
              <div className="flex justify-center gap-0.5 mt-1">
                {Array(16).fill(0).map((_, i) => (
                  <div key={i} className={`w-8 text-center text-[8px] ${theme.text.muted}`}>{i}</div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { element: '"apple"', hashes: 'h1→3, h2→4, h3→11', result: 'All 1 → Probably in set', color: 'green' },
                { element: '"banana"', hashes: 'h1→1, h2→7, h3→15', result: 'All 1 → Probably in set', color: 'green' },
                { element: '"cherry"', hashes: 'h1→2, h2→5, h3→9', result: 'Bit 2 is 0 → NOT in set', color: 'red' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${theme.bg.secondary} border ${theme.border.primary}`}>
                  <span className={`text-sm font-mono font-semibold ${theme.text.primary} w-20`}>{item.element}</span>
                  <span className={`text-xs ${theme.text.muted} flex-1`}>{item.hashes}</span>
                  <span className={`text-xs font-medium text-[var(--${item.color})]`}>{item.result}</span>
                </div>
              ))}
            </div>
            <div className={`mt-3 text-xs ${theme.text.muted} text-center`}>
              False positives possible. False negatives impossible.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Quiz component ───────────────────────────────────────────────────────────
const QuizSection = ({ section, theme }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIdx, optIdx) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const score = section.questions.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);

  return (
    <div className={`mb-8 ${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
      <div className="px-6 py-4 bg-[var(--purple-bg)] border-b border-[var(--purple-border)]">
        <h2 className={`text-lg font-bold ${theme.text.primary}`}>📝 {section.heading || 'Test Your Knowledge'}</h2>
        {section.description && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.description}</p>}
      </div>
      <div className="p-6 space-y-6">
        {section.questions.map((q, qIdx) => (
          <div key={qIdx}>
            <p className={`text-sm font-medium ${theme.text.primary} mb-3`}>{qIdx + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = answers[qIdx] === optIdx;
                const isCorrect = q.correct === optIdx;
                let optClass = `${theme.bg.secondary} ${theme.border.primary} border`;
                if (showResults && isSelected && isCorrect) optClass = 'bg-[var(--success-bg)] border-[var(--success-border)] border';
                else if (showResults && isSelected && !isCorrect) optClass = 'bg-[var(--error-bg)] border-[var(--error-border)] border';
                else if (showResults && isCorrect) optClass = 'bg-[var(--success-bg)] border-[var(--success-border)] border opacity-60';
                else if (isSelected) optClass = 'bg-[var(--accent-subtle)] border-[var(--accent)] border';

                return (
                  <button key={optIdx} onClick={() => handleSelect(qIdx, optIdx)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${optClass} ${!showResults ? 'cursor-pointer hover:border-[#06b6d4]/50' : 'cursor-default'}`}>
                    <span className={`${theme.text.primary}`}>{opt}</span>
                  </button>
                );
              })}
            </div>
            {showResults && answers[qIdx] !== undefined && answers[qIdx] !== q.correct && q.explanation && (
              <p className="text-xs text-[var(--error)] mt-2 pl-4 border-l-2 border-[var(--error-border)]">{q.explanation}</p>
            )}
            {showResults && answers[qIdx] === q.correct && q.explanation && (
              <p className="text-xs text-[var(--success)] mt-2 pl-4 border-l-2 border-[var(--success-border)]">{q.explanation}</p>
            )}
          </div>
        ))}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--purple-border)]">
          {!showResults ? (
            <button onClick={() => setShowResults(true)}
              disabled={Object.keys(answers).length < section.questions.length}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${Object.keys(answers).length >= section.questions.length ? 'bg-purple-500 text-white hover:bg-purple-600' : `${theme.bg.secondary} ${theme.text.muted} cursor-not-allowed`}`}>
              Check Answers
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${score === section.questions.length ? 'text-[var(--success)]' : score >= section.questions.length / 2 ? 'text-[var(--warning)]' : 'text-[var(--error)]'}`}>
                {score}/{section.questions.length} correct
              </span>
              <button onClick={() => { setAnswers({}); setShowResults(false); }} className={`text-xs ${theme.text.muted} hover:text-[var(--accent)] transition-colors`}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Section renderer ─────────────────────────────────────────────────────────
const Section = ({ section, theme }) => {
  switch (section.type) {

    case 'text':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          <div className={`${theme.text.secondary} leading-relaxed whitespace-pre-line text-base`}>
            <RichText text={section.body} theme={theme} />
          </div>
        </div>
      );

    case 'requirements':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.functional && (
              <div className={`${theme.bg.card} ${theme.border.primary} border rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                  <span className="font-semibold text-[var(--success)] text-sm">Functional Requirements</span>
                </div>
                <div className="space-y-2">
                  {section.functional.map((req, i) => (
                    <div key={i} className={`flex items-start gap-2 text-sm ${theme.text.secondary}`}>
                      <span className="text-green-500 mt-0.5 shrink-0">•</span>
                      <RichText text={req} theme={theme} />
                    </div>
                  ))}
                </div>
                {section.functionalOutOfScope && (
                  <div className={`mt-4 pt-4 border-t ${theme.border.primary}`}>
                    <p className={`text-xs ${theme.text.muted} mb-2 font-medium`}>Out of scope:</p>
                    {section.functionalOutOfScope.map((req, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs ${theme.text.muted}`}>
                        <XCircle className={`w-3 h-3 mt-0.5 shrink-0 ${theme.text.muted}`} />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {section.nonFunctional && (
              <div className={`${theme.bg.card} ${theme.border.primary} border rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-[var(--cyan)]" />
                  <span className="font-semibold text-[var(--cyan)] text-sm">Non-Functional Requirements</span>
                </div>
                <div className="space-y-2">
                  {section.nonFunctional.map((req, i) => (
                    <div key={i} className={`flex items-start gap-2 text-sm ${theme.text.secondary}`}>
                      <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
                      <RichText text={req} theme={theme} />
                    </div>
                  ))}
                </div>
                {section.nonFunctionalOutOfScope && (
                  <div className={`mt-4 pt-4 border-t ${theme.border.primary}`}>
                    <p className={`text-xs ${theme.text.muted} mb-2 font-medium`}>Out of scope:</p>
                    {section.nonFunctionalOutOfScope.map((req, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs ${theme.text.muted}`}>
                        <XCircle className={`w-3 h-3 mt-0.5 shrink-0 ${theme.text.muted}`} />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );

    case 'api':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          {section.description && <p className={`${theme.text.secondary} mb-4 text-sm`}>{section.description}</p>}
          <div className="space-y-3">
            {section.endpoints.map((ep, i) => (
              <div key={i} className={`${theme.bg.secondary} rounded-xl border ${theme.border.primary} overflow-hidden`}>
                <div className={`flex items-center gap-3 px-4 py-3 border-b ${theme.border.primary}`}>
                  <span className={`text-xs font-bold px-2 py-1 rounded font-mono ${
                    ep.method === 'GET' ? 'bg-[var(--green-bg)] text-[var(--green)]' :
                    ep.method === 'POST' ? 'bg-[var(--blue-bg)] text-[var(--blue)]' :
                    ep.method === 'PUT' || ep.method === 'PATCH' ? 'bg-[var(--yellow-bg)] text-[var(--yellow)]' :
                    'bg-[var(--red-bg)] text-[var(--red)]'
                  }`}>{ep.method}</span>
                  <code className="text-[var(--cyan)] text-sm font-mono">{ep.path}</code>
                  {ep.label && <span className={`ml-auto text-xs ${theme.text.muted}`}>{ep.label}</span>}
                </div>
                {(ep.request || ep.response) && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ep.request && (
                      <div>
                        <p className={`text-xs ${theme.text.muted} mb-2 font-medium uppercase tracking-wider`}>Request</p>
                        <pre className="text-xs text-[var(--green)] font-mono whitespace-pre-wrap">{ep.request}</pre>
                      </div>
                    )}
                    {ep.response && (
                      <div>
                        <p className={`text-xs ${theme.text.muted} mb-2 font-medium uppercase tracking-wider`}>Response</p>
                        <pre className="text-xs text-[var(--cyan)] font-mono whitespace-pre-wrap">{ep.response}</pre>
                      </div>
                    )}
                  </div>
                )}
                {ep.note && <p className={`px-4 pb-3 text-xs ${theme.text.muted} italic`}>{ep.note}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'schema':
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          {section.description && <p className={`${theme.text.secondary} mb-4 text-sm`}>{section.description}</p>}
          <div className="space-y-4">
            {section.entities.map((entity, i) => (
              <div key={i} className={`${theme.bg.secondary} rounded-xl border ${theme.border.primary} overflow-hidden`}>
                <div className={`flex items-center gap-2 px-4 py-3 border-b ${theme.border.primary}`}>
                  <Layers className="w-4 h-4 text-[var(--purple)]" />
                  <span className="text-[var(--purple)] font-semibold text-sm font-mono">{entity.name}</span>
                  {entity.note && <span className={`ml-auto text-xs ${theme.text.muted}`}>{entity.note}</span>}
                </div>
                <div className="p-4">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className={`${theme.text.muted} border-b ${theme.border.primary}`}>
                        <th className="text-left pb-2 pr-4">Field</th>
                        <th className="text-left pb-2 pr-4">Type</th>
                        <th className="text-left pb-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entity.fields.map((field, fi) => (
                        <tr key={fi} className={`border-b ${theme.border.primary}`}>
                          <td className="py-1.5 pr-4 text-[var(--cyan)]">{field.name}</td>
                          <td className="py-1.5 pr-4 text-[var(--yellow)]">{field.type}</td>
                          <td className={`py-1.5 ${theme.text.muted}`}>{field.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'deepdive':
      return (
        <div className="mb-8">
          <div className={`${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
            <div className={`px-6 py-4 bg-gradient-to-r from-[#06b6d4]/10 to-transparent border-b ${theme.border.primary}`}>
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#06b6d4]" />
                <h2 className={`text-lg font-bold ${theme.text.primary}`}>{section.heading}</h2>
              </div>
              {section.subtitle && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.subtitle}</p>}
            </div>
            <div className="p-6 space-y-6">
              {section.content.map((sub, i) => (
                <Section key={i} section={sub} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      );

    case 'levels':
      const levelColors = { 'Mid-level': 'blue', 'Senior': 'purple', 'Staff+': 'orange' };
      return (
        <div className="mb-8">
          {section.heading && <h2 className={`text-xl md:text-2xl font-bold ${theme.text.primary} mb-4`}>{section.heading}</h2>}
          <div className="space-y-4">
            {section.levels.map((level, i) => {
              const color = levelColors[level.title] || 'cyan';
              return (
                <div key={i} className={`${theme.bg.card} border ${c(color).border} rounded-xl p-5`}>
                  <h3 className={`font-bold ${c(color).text} mb-3`}>{level.title}</h3>
                  <div className={`${theme.text.secondary} text-sm leading-relaxed whitespace-pre-line`}>
                    <RichText text={level.body} theme={theme} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'animation':
      const AnimComponent = ANIMATIONS[section.id];
      return (
        <div className={`mb-8 rounded-2xl ${theme.bg.card} ${theme.border.primary} border overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${theme.border.primary}`}>
            <h3 className={`font-semibold ${theme.text.primary}`}>{section.heading}</h3>
            {section.body && <p className={`text-sm ${theme.text.muted} mt-1`}>{section.body}</p>}
          </div>
          <div className={`p-6 ${theme.bg.secondary}`}>
            {AnimComponent ? <AnimComponent /> : <div className={`text-center ${theme.text.muted} py-8`}>Animation loading...</div>}
          </div>
        </div>
      );

    case 'callout':
      const style = calloutStyles[section.variant] || calloutStyles.info;
      return (
        <div className={`mb-8 p-5 rounded-xl border ${style.bg}`}>
          <p className={`font-semibold mb-2 ${style.labelColor}`}>{style.label}: {section.heading}</p>
          <div className={`${theme.text.secondary} text-sm leading-relaxed`}>
            <RichText text={section.body} theme={theme} />
          </div>
        </div>
      );

    case 'quiz':
      return <QuizSection section={section} theme={theme} />;

    case 'diagram':
      return <DiagramSection section={section} theme={theme} />;

    case 'architecture':
      return <ArchitectureDiagram {...section.config} title={section.heading} caption={section.caption} />;

    case 'faq':
      return (
        <div className={`mb-8 ${theme.bg.card} ${theme.border.primary} border rounded-2xl overflow-hidden`}>
          <div className="px-6 py-4 border-b border-[var(--border-primary)]">
            <h2 className={`text-lg font-bold ${theme.text.primary}`}>❓ {section.heading || 'Frequently Asked Questions'}</h2>
          </div>
          <div className="divide-y divide-[var(--border-primary)]">
            {section.questions.map((faq, i) => (
              <details key={i} className="group">
                <summary className={`flex items-center justify-between px-6 py-4 cursor-pointer ${theme.text.primary} font-medium text-sm hover:bg-[var(--bg-secondary)] transition-colors list-none`}>
                  <span>{faq.q}</span>
                  <span className="text-[var(--text-muted)] text-xs group-open:rotate-90 transition-transform">▶</span>
                </summary>
                <div className={`px-6 pb-4 ${theme.text.secondary} text-sm leading-relaxed`}>
                  <RichText text={faq.a} theme={theme} />
                </div>
              </details>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
};

const SystemDesignLesson = () => {
  const { slug } = useParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const topic = getTopicBySlug(slug);
  const next = getNextTopic(slug);
  const prev = getPrevTopic(slug);
  const allSlugs = SECTIONS.flatMap(s => s.topics);
  const currentIndex = allSlugs.indexOf(slug);
  const access = getTopicAccess(slug, user);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!topic) {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center`}>
        <div className="text-center">
          <p className={`${theme.text.primary} text-xl mb-4`}>Lesson not found</p>
          <Link to="/learn/system-design" className="text-[#06b6d4] hover:underline">← Back to course</Link>
        </div>
      </div>
    );
  }

  // Locked — show upgrade prompt
  if (access === 'locked') {
    return (
      <div className={`min-h-screen ${theme.bg.primary}`}>
        <Header />
        <div className="pt-24 pb-20 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className={`text-2xl font-bold ${theme.text.primary} mb-3`}>{topic.title}</h1>
            <p className={`${theme.text.secondary} mb-6`}>
              This lesson requires a paid plan. Upgrade to unlock all system design content.
            </p>
            <div className="space-y-3">
              <Link
                to="/apply"
                className="block w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all text-center"
              >
                <Crown className="w-4 h-4 inline mr-2" />
                Get Elite — Full Access
              </Link>
              <Link
                to="/apply"
                className={`block w-full px-6 py-3 ${theme.bg.card} ${theme.border.primary} border rounded-xl ${theme.text.primary} font-medium text-center hover:border-blue-500/50 transition-all`}
              >
                Get Pro — Partial Access
              </Link>
              <Link
                to="/learn/system-design"
                className={`block text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors mt-4`}
              >
                ← Back to course
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <div className="pt-20 flex">

        {/* Sidebar — desktop */}
        <aside className={`hidden lg:flex flex-col w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r ${theme.border.primary} ${theme.bg.card}`}>
          <div className={`p-4 border-b ${theme.border.primary}`}>
            <Link to="/learn/system-design" className={`flex items-center gap-2 text-sm ${theme.text.muted} hover:text-[#06b6d4] transition-colors`}>
              <ArrowLeft className="w-4 h-4" />
              System Design
            </Link>
          </div>
          <nav className="p-3 space-y-4">
            {SECTIONS.map((section) => (
              <div key={section.id}>
                <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${theme.text.muted} flex items-center gap-1.5`}>
                  <span>{section.title}</span>
                </div>
                {section.topics.map((topicSlug) => {
                  const t = TOPICS[topicSlug];
                  if (!t) return null;
                  const topicAccess = getTopicAccess(topicSlug, user);
                  const isTopicLocked = topicAccess === 'locked';
                  if (isTopicLocked) {
                    return (
                      <div key={topicSlug} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${theme.text.muted} cursor-not-allowed`}>
                        
                        <span className="truncate">{t.title}</span>
                        <Lock className="w-3 h-3 ml-auto shrink-0" />
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={topicSlug}
                      to={`/learn/system-design/${topicSlug}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        topicSlug === slug
                          ? 'bg-[#06b6d4]/20 text-[#06b6d4] font-medium'
                          : `${theme.text.secondary} ${theme.bg.hover}`
                      }`}
                    >
                      
                      <span className="truncate">{t.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className={`w-72 ${theme.bg.card} border-r ${theme.border.primary} flex flex-col overflow-y-auto`}>
              <div className={`p-4 border-b ${theme.border.primary} flex items-center justify-between`}>
                <Link to="/learn/system-design" className={`text-sm ${theme.text.muted}`}>System Design</Link>
                <button onClick={() => setSidebarOpen(false)}><X className={`w-5 h-5 ${theme.text.secondary}`} /></button>
              </div>
              <nav className="p-3 space-y-4">
                {SECTIONS.map((section) => (
                  <div key={section.id}>
                    <div className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${theme.text.muted} flex items-center gap-1.5`}>
                      <span>{section.title}</span>
                    </div>
                    {section.topics.map((topicSlug) => {
                      const t = TOPICS[topicSlug];
                      if (!t) return null;
                      const topicAccess = getTopicAccess(topicSlug, user);
                      if (topicAccess === 'locked') {
                        return (
                          <div key={topicSlug} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${theme.text.muted} cursor-not-allowed`}>
                            
                            <span className="truncate">{t.title}</span>
                            <Lock className="w-3 h-3 ml-auto shrink-0" />
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={topicSlug}
                          to={`/learn/system-design/${topicSlug}`}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            topicSlug === slug ? 'bg-[#06b6d4]/20 text-[#06b6d4] font-medium' : `${theme.text.secondary} ${theme.bg.hover}`
                          }`}
                        >
                          
                          <span className="truncate">{t.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-4 py-10">

            {/* Mobile top bar */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <button onClick={() => setSidebarOpen(true)} className={`p-2 rounded-lg ${theme.bg.card} border ${theme.border.primary}`}>
                <Menu className={`w-5 h-5 ${theme.text.secondary}`} />
              </button>
              <div className={`text-sm ${theme.text.muted}`}>
                {currentIndex + 1} / {allSlugs.length}
              </div>
            </div>

            {/* Breadcrumb */}
            <div className={`flex items-center gap-2 text-sm ${theme.text.muted} mb-6`}>
              <Link to="/learn/system-design" className="hover:text-[#06b6d4] transition-colors">System Design</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#06b6d4]">{topic.title}</span>
            </div>

            {/* Lesson header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl"></span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    topic.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                    topic.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{topic.difficulty}</span>
                  <span className={`flex items-center gap-1 text-xs ${theme.text.muted}`}>
                    <Clock className="w-3.5 h-3.5" />{topic.duration}
                  </span>
                </div>
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold ${theme.text.primary} mb-2`}>{topic.title}</h1>
              <p className={`text-lg ${theme.text.secondary}`}>{topic.subtitle}</p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-[#06b6d4]/50 to-transparent mb-10" />

            {/* Sections */}
            {topic.sections.map((section, i) => (
              <Section key={i} section={section} theme={theme} />
            ))}

            {/* Preview upgrade banner */}
            {access === 'preview' && (
              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-center">
                <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <h3 className={`text-lg font-bold ${theme.text.primary} mb-2`}>You're viewing a free preview</h3>
                <p className={`${theme.text.secondary} text-sm mb-4 max-w-md mx-auto`}>
                  Upgrade to unlock all topics, question breakdowns, patterns, and technologies.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/apply" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all">
                    <Crown className="w-4 h-4" />
                    Get Elite — Full Access
                  </Link>
                  <Link to="/apply" className={`inline-flex items-center gap-2 px-6 py-3 ${theme.bg.card} ${theme.border.primary} border rounded-xl ${theme.text.primary} font-medium hover:border-blue-500/50 transition-all`}>
                    Get Pro — Partial Access
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={`flex items-center justify-between mt-14 pt-8 border-t ${theme.border.primary}`}>
              {prev ? (
                <Link
                  to={`/learn/system-design/${prev.slug}`}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl ${theme.bg.card} border ${theme.border.primary} hover:border-[#06b6d4]/50 transition-all group`}
                >
                  <ArrowLeft className="w-4 h-4 text-[#06b6d4]" />
                  <div className="text-left">
                    <p className={`text-xs ${theme.text.muted}`}>Previous</p>
                    <p className={`text-sm font-medium ${theme.text.primary} group-hover:text-[#06b6d4] transition-colors`}>{prev.title}</p>
                  </div>
                </Link>
              ) : <div />}

              {next ? (
                <Link
                  to={`/learn/system-design/${next.slug}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0e7490] transition-all group"
                >
                  <div className="text-right">
                    <p className="text-xs opacity-80">Next</p>
                    <p className="text-sm font-medium">{next.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/learn/system-design"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0e7490] transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Course Complete!</span>
                </Link>
              )}
            </div>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SystemDesignLesson;
