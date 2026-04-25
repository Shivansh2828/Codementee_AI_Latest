/**
 * Linux Terminal Simulator
 * Simulates a subset of Linux commands with sample data for practice.
 * Supports: ls, cat, head, tail, grep, awk, sed, sort, uniq, wc, cut, find,
 *           echo, touch, rm, mkdir, pwd, cd, ps, df, du, free, top, ping,
 *           curl, whoami, hostname, uname, uptime, nproc, clear, help
 */

// ── Sample File System ──────────────────────────────────────────────────────
const INITIAL_FS = {
  '/': { type: 'dir', children: ['home', 'var', 'etc', 'tmp', 'proc'] },
  '/home': { type: 'dir', children: ['ubuntu'] },
  '/home/ubuntu': { type: 'dir', children: ['projects', '.bashrc', 'notes.txt'] },
  '/home/ubuntu/.bashrc': { type: 'file', content: '# ~/.bashrc\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\nalias gs="git status"\n\n# Prompt\nPS1="\\u@\\h:\\w\\$ "\n' },
  '/home/ubuntu/notes.txt': { type: 'file', content: 'TODO: Learn grep regex\nTODO: Practice awk one-liners\nDONE: Setup SSH keys\nDONE: Install Docker\nTODO: Study Kubernetes\nDONE: Configure Nginx\nTODO: Write deployment script\n' },
  '/home/ubuntu/projects': { type: 'dir', children: ['app', 'scripts'] },
  '/home/ubuntu/projects/app': { type: 'dir', children: ['server.py', 'config.yml', 'requirements.txt'] },
  '/home/ubuntu/projects/app/server.py': { type: 'file', content: '#!/usr/bin/env python3\nfrom flask import Flask\nimport os\n\napp = Flask(__name__)\n\n@app.route("/health")\ndef health():\n    return {"status": "ok"}\n\n@app.route("/api/users")\ndef users():\n    return {"users": ["alice", "bob", "charlie"]}\n\nif __name__ == "__main__":\n    port = int(os.environ.get("PORT", 8080))\n    app.run(host="0.0.0.0", port=port)\n' },
  '/home/ubuntu/projects/app/config.yml': { type: 'file', content: 'app:\n  name: myapp\n  port: 8080\n  debug: false\n\ndatabase:\n  host: db.internal\n  port: 5432\n  name: production\n  max_connections: 100\n\nredis:\n  host: cache.internal\n  port: 6379\n  ttl: 300\n' },
  '/home/ubuntu/projects/app/requirements.txt': { type: 'file', content: 'flask==3.0.0\ngunicorn==21.2.0\npsycopg2-binary==2.9.9\nredis==5.0.1\nrequests==2.31.0\n' },
  '/home/ubuntu/projects/scripts': { type: 'dir', children: ['deploy.sh', 'backup.sh'] },
  '/home/ubuntu/projects/scripts/deploy.sh': { type: 'file', content: '#!/bin/bash\nset -euo pipefail\n\nAPP_NAME="myapp"\nIMAGE_TAG=${1:-latest}\n\necho "Deploying $APP_NAME:$IMAGE_TAG..."\ndocker pull $APP_NAME:$IMAGE_TAG\ndocker-compose down\ndocker-compose up -d\n\necho "Waiting for health check..."\nfor i in {1..30}; do\n  if curl -sf http://localhost:8080/health > /dev/null; then\n    echo "Deploy complete!"\n    exit 0\n  fi\n  sleep 2\ndone\n\necho "ERROR: Health check failed"\nexit 1\n' },
  '/home/ubuntu/projects/scripts/backup.sh': { type: 'file', content: '#!/bin/bash\nset -euo pipefail\n\nBACKUP_DIR="/var/backups"\nTIMESTAMP=$(date +%Y%m%d_%H%M%S)\n\nmkdir -p $BACKUP_DIR\ntar -czf $BACKUP_DIR/app-$TIMESTAMP.tar.gz /home/ubuntu/projects/app\n\necho "Backup created: app-$TIMESTAMP.tar.gz"\n\n# Keep only last 5 backups\nls -t $BACKUP_DIR/app-*.tar.gz | tail -n +6 | xargs rm -f\n' },
  '/var': { type: 'dir', children: ['log'] },
  '/var/log': { type: 'dir', children: ['syslog', 'auth.log', 'nginx'] },
  '/var/log/syslog': { type: 'file', content: 'Jan 15 10:00:01 server systemd[1]: Started Daily apt download activities.\nJan 15 10:05:23 server kernel: [42156.123] TCP: request_sock_TCP: Possible SYN flooding on port 80.\nJan 15 10:10:45 server sshd[2341]: Accepted publickey for ubuntu from 10.0.0.5 port 52341\nJan 15 10:15:02 server CRON[2456]: (root) CMD (/usr/local/bin/cleanup.sh)\nJan 15 10:20:18 server nginx[1234]: 2024/01/15 10:20:18 [error] upstream timed out\nJan 15 10:25:33 server kernel: [42456.789] Out of memory: Kill process 3456 (java) score 850\nJan 15 10:30:01 server systemd[1]: Starting Cleanup of Temporary Directories...\nJan 15 10:35:44 server sshd[2567]: Failed password for invalid user admin from 203.0.113.50 port 44321\nJan 15 10:40:12 server nginx[1234]: 2024/01/15 10:40:12 [warn] worker connections are not enough\nJan 15 10:45:55 server kernel: [42756.456] EXT4-fs warning: maximal mount count reached\n' },
  '/var/log/auth.log': { type: 'file', content: 'Jan 15 08:00:01 server sshd[1001]: Accepted publickey for ubuntu from 10.0.0.5 port 52100\nJan 15 08:15:23 server sshd[1045]: Failed password for root from 203.0.113.10 port 44100\nJan 15 08:15:24 server sshd[1045]: Failed password for root from 203.0.113.10 port 44100\nJan 15 08:15:25 server sshd[1045]: Failed password for root from 203.0.113.10 port 44100\nJan 15 09:00:01 server sudo: ubuntu : TTY=pts/0 ; PWD=/home/ubuntu ; USER=root ; COMMAND=/usr/bin/apt update\nJan 15 09:30:45 server sshd[1100]: Accepted publickey for deploy from 10.0.0.20 port 52200\nJan 15 10:00:12 server sshd[1150]: Failed password for invalid user admin from 203.0.113.50 port 44321\nJan 15 10:00:13 server sshd[1150]: Failed password for invalid user admin from 203.0.113.50 port 44322\nJan 15 10:30:00 server sshd[1200]: Accepted publickey for ubuntu from 10.0.0.5 port 52300\nJan 15 11:00:01 server sudo: deploy : TTY=pts/1 ; PWD=/opt/app ; USER=root ; COMMAND=/usr/bin/systemctl restart myapp\n' },
  '/var/log/nginx': { type: 'dir', children: ['access.log', 'error.log'] },
  '/var/log/nginx/access.log': { type: 'file', content: '192.168.1.10 - - [15/Jan/2024:10:00:01 +0000] "GET /api/users HTTP/1.1" 200 1234 0.045\n192.168.1.20 - - [15/Jan/2024:10:00:02 +0000] "POST /api/orders HTTP/1.1" 201 567 0.123\n192.168.1.10 - - [15/Jan/2024:10:00:03 +0000] "GET /api/products HTTP/1.1" 200 8901 0.067\n10.0.0.5 - - [15/Jan/2024:10:00:04 +0000] "GET /health HTTP/1.1" 200 15 0.002\n192.168.1.30 - - [15/Jan/2024:10:00:05 +0000] "GET /api/users HTTP/1.1" 200 1234 0.051\n203.0.113.50 - - [15/Jan/2024:10:00:06 +0000] "GET /admin HTTP/1.1" 403 120 0.001\n192.168.1.10 - - [15/Jan/2024:10:00:07 +0000] "POST /api/checkout HTTP/1.1" 500 89 2.345\n192.168.1.20 - - [15/Jan/2024:10:00:08 +0000] "GET /api/products HTTP/1.1" 200 8901 0.072\n192.168.1.40 - - [15/Jan/2024:10:00:09 +0000] "GET /api/users HTTP/1.1" 200 1234 0.048\n192.168.1.10 - - [15/Jan/2024:10:00:10 +0000] "POST /api/checkout HTTP/1.1" 500 89 3.102\n10.0.0.5 - - [15/Jan/2024:10:00:11 +0000] "GET /health HTTP/1.1" 200 15 0.001\n192.168.1.30 - - [15/Jan/2024:10:00:12 +0000] "GET /api/orders HTTP/1.1" 200 4567 0.089\n192.168.1.50 - - [15/Jan/2024:10:00:13 +0000] "GET /api/users HTTP/1.1" 200 1234 0.055\n203.0.113.50 - - [15/Jan/2024:10:00:14 +0000] "POST /api/login HTTP/1.1" 401 45 0.012\n192.168.1.10 - - [15/Jan/2024:10:00:15 +0000] "GET /api/products HTTP/1.1" 200 8901 0.063\n192.168.1.20 - - [15/Jan/2024:10:00:16 +0000] "POST /api/checkout HTTP/1.1" 201 234 0.156\n192.168.1.40 - - [15/Jan/2024:10:00:17 +0000] "GET /api/orders HTTP/1.1" 200 4567 0.091\n10.0.0.5 - - [15/Jan/2024:10:00:18 +0000] "GET /health HTTP/1.1" 200 15 0.001\n192.168.1.10 - - [15/Jan/2024:10:00:19 +0000] "GET /api/users HTTP/1.1" 200 1234 0.047\n192.168.1.30 - - [15/Jan/2024:10:00:20 +0000] "POST /api/orders HTTP/1.1" 201 567 0.134\n' },
  '/var/log/nginx/error.log': { type: 'file', content: '2024/01/15 10:00:07 [error] 1234#0: *5678 upstream timed out (110: Connection timed out) while connecting to upstream, client: 192.168.1.10, server: myapp.com, request: "POST /api/checkout HTTP/1.1", upstream: "http://127.0.0.1:8080/api/checkout"\n2024/01/15 10:00:10 [error] 1234#0: *5679 upstream timed out (110: Connection timed out) while connecting to upstream, client: 192.168.1.10, server: myapp.com, request: "POST /api/checkout HTTP/1.1", upstream: "http://127.0.0.1:8080/api/checkout"\n2024/01/15 10:00:14 [error] 1234#0: *5680 access forbidden by rule, client: 203.0.113.50, server: myapp.com, request: "GET /admin HTTP/1.1"\n2024/01/15 10:00:14 [warn] 1234#0: *5681 worker_connections are not enough, client: 192.168.1.60\n' },
  '/etc': { type: 'dir', children: ['hosts', 'passwd', 'nginx', 'ssh'] },
  '/etc/hosts': { type: 'file', content: '127.0.0.1   localhost\n10.0.0.5    db.internal\n10.0.0.10   cache.internal\n10.0.0.15   api.internal\n' },
  '/etc/passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash\nnginx:x:101:101:nginx:/var/lib/nginx:/usr/sbin/nologin\npostgres:x:102:102:PostgreSQL:/var/lib/postgresql:/bin/bash\ndeploy:x:1001:1001:Deploy User:/home/deploy:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n' },
  '/etc/nginx': { type: 'dir', children: ['nginx.conf'] },
  '/etc/nginx/nginx.conf': { type: 'file', content: 'worker_processes auto;\nevents {\n    worker_connections 1024;\n}\nhttp {\n    upstream backend {\n        server 127.0.0.1:8080;\n    }\n    server {\n        listen 80;\n        server_name myapp.com;\n        location / {\n            proxy_pass http://backend;\n            proxy_set_header Host $host;\n        }\n        location /health {\n            return 200 "ok";\n        }\n    }\n}\n' },
  '/etc/ssh': { type: 'dir', children: ['sshd_config'] },
  '/etc/ssh/sshd_config': { type: 'file', content: 'Port 22\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nMaxAuthTries 3\nClientAliveInterval 300\nClientAliveCountMax 2\n' },
  '/tmp': { type: 'dir', children: ['data.csv'] },
  '/tmp/data.csv': { type: 'file', content: 'name,age,city,salary\nalice,30,new york,95000\nbob,25,san francisco,85000\ncharlie,35,seattle,110000\ndiana,28,austin,78000\neve,32,boston,102000\nfrank,40,chicago,120000\ngrace,27,denver,88000\nhenry,33,portland,97000\n' },
  '/proc': { type: 'dir', children: ['cpuinfo', 'meminfo', 'loadavg'] },
  '/proc/cpuinfo': { type: 'file', content: 'processor\t: 0\nmodel name\t: Intel(R) Xeon(R) CPU @ 2.20GHz\ncpu MHz\t\t: 2200.000\ncache size\t: 56320 KB\ncpu cores\t: 4\n\nprocessor\t: 1\nmodel name\t: Intel(R) Xeon(R) CPU @ 2.20GHz\ncpu MHz\t\t: 2200.000\ncache size\t: 56320 KB\ncpu cores\t: 4\n\nprocessor\t: 2\nmodel name\t: Intel(R) Xeon(R) CPU @ 2.20GHz\ncpu MHz\t\t: 2200.000\ncache size\t: 56320 KB\ncpu cores\t: 4\n\nprocessor\t: 3\nmodel name\t: Intel(R) Xeon(R) CPU @ 2.20GHz\ncpu MHz\t\t: 2200.000\ncache size\t: 56320 KB\ncpu cores\t: 4\n' },
  '/proc/meminfo': { type: 'file', content: 'MemTotal:       16384000 kB\nMemFree:         1234567 kB\nMemAvailable:    7654321 kB\nBuffers:          456789 kB\nCached:          5432100 kB\nSwapTotal:       4096000 kB\nSwapFree:        3584000 kB\n' },
  '/proc/loadavg': { type: 'file', content: '1.23 0.98 0.76 2/345 12345\n' },
};

// ── Path utilities ──────────────────────────────────────────────────────────
const resolvePath = (cwd, path) => {
  if (!path) return cwd;
  if (path === '~') return '/home/ubuntu';
  if (path.startsWith('~/')) return '/home/ubuntu/' + path.slice(2);
  if (path.startsWith('/')) return path.replace(/\/+$/, '') || '/';
  // Relative path
  const parts = (cwd === '/' ? [] : cwd.split('/')).concat(path.split('/'));
  const resolved = [];
  for (const p of parts) {
    if (p === '' || p === '.') continue;
    if (p === '..') { resolved.pop(); continue; }
    resolved.push(p);
  }
  return '/' + resolved.join('/') || '/';
};

// ── Simulator Class ─────────────────────────────────────────────────────────
export class LinuxSimulator {
  constructor() {
    this.fs = JSON.parse(JSON.stringify(INITIAL_FS));
    this.cwd = '/home/ubuntu';
    this.user = 'ubuntu';
    this.hostname = 'codementee';
    this.history = [];
    this.env = { PATH: '/usr/local/bin:/usr/bin:/bin', HOME: '/home/ubuntu', USER: 'ubuntu', SHELL: '/bin/bash' };
  }

  getPrompt() {
    const dir = this.cwd === '/home/ubuntu' ? '~' : this.cwd.replace('/home/ubuntu', '~');
    return `${this.user}@${this.hostname}:${dir}$ `;
  }

  execute(input) {
    const trimmed = input.trim();
    if (!trimmed) return '';
    this.history.push(trimmed);

    // Handle pipes
    if (trimmed.includes(' | ')) {
      return this.executePipe(trimmed);
    }

    return this.executeOne(trimmed);
  }

  executePipe(input) {
    const commands = input.split(' | ').map(c => c.trim());
    let output = null;
    for (const cmd of commands) {
      output = this.executeOne(cmd, output);
    }
    return output || '';
  }

  executeOne(input, pipeInput = null) {
    const parts = this.parseArgs(input);
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        case 'pwd': return this.cwd;
        case 'cd': return this.cmdCd(args);
        case 'ls': return this.cmdLs(args);
        case 'cat': return this.cmdCat(args, pipeInput);
        case 'echo': return args.join(' ').replace(/^["']|["']$/g, '');
        case 'head': return this.cmdHead(args, pipeInput);
        case 'tail': return this.cmdTail(args, pipeInput);
        case 'grep': return this.cmdGrep(args, pipeInput);
        case 'awk': return this.cmdAwk(args, pipeInput);
        case 'sed': return this.cmdSed(args, pipeInput);
        case 'sort': return this.cmdSort(args, pipeInput);
        case 'uniq': return this.cmdUniq(args, pipeInput);
        case 'wc': return this.cmdWc(args, pipeInput);
        case 'cut': return this.cmdCut(args, pipeInput);
        case 'find': return this.cmdFind(args);
        case 'touch': return this.cmdTouch(args);
        case 'mkdir': return this.cmdMkdir(args);
        case 'rm': return this.cmdRm(args);
        case 'cp': return this.cmdCp(args);
        case 'mv': return this.cmdMv(args);
        case 'ps': return this.cmdPs(args);
        case 'top': return this.cmdTop();
        case 'df': return this.cmdDf(args);
        case 'du': return this.cmdDu(args);
        case 'free': return this.cmdFree(args);
        case 'ping': return this.cmdPing(args);
        case 'curl': return this.cmdCurl(args);
        case 'ss': return this.cmdSs(args);
        case 'netstat': return this.cmdSs(args);
        case 'nslookup': return this.cmdNslookup(args);
        case 'whoami': return this.user;
        case 'hostname': return this.hostname;
        case 'id': return `uid=1000(${this.user}) gid=1000(${this.user}) groups=1000(${this.user}),27(sudo),999(docker)`;
        case 'uname': return this.cmdUname(args);
        case 'uptime': return ' 14:30:00 up 45 days, 3:22, 2 users, load average: 1.23, 0.98, 0.76';
        case 'nproc': return '4';
        case 'history': return this.history.map((h, i) => `  ${i + 1}  ${h}`).join('\n');
        case 'clear': return '\x1BCLEAR';
        case 'exit': return 'logout';
        case 'help': return this.cmdHelp();
        case 'man': return `No manual entry for ${args[0] || 'unknown'}. Try: help`;
        case 'sudo': return this.executeOne(args.join(' '), pipeInput);
        case 'chmod': return '';
        case 'chown': return '';
        default: return `${cmd}: command not found. Type 'help' for available commands.`;
      }
    } catch (e) {
      return `${cmd}: ${e.message}`;
    }
  }

  parseArgs(input) {
    const args = [];
    let current = '';
    let inSingle = false, inDouble = false;
    for (const ch of input) {
      if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
      if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
      if (ch === ' ' && !inSingle && !inDouble) {
        if (current) args.push(current);
        current = '';
        continue;
      }
      current += ch;
    }
    if (current) args.push(current);
    return args;
  }

  // ── File system commands ─────────────────────────────────────────────────
  cmdCd(args) {
    const target = resolvePath(this.cwd, args[0] || '~');
    if (args[0] === '-') { const prev = this._prevDir || this.cwd; this._prevDir = this.cwd; this.cwd = prev; return prev; }
    const node = this.fs[target];
    if (!node) throw new Error(`cd: ${args[0]}: No such file or directory`);
    if (node.type !== 'dir') throw new Error(`cd: ${args[0]}: Not a directory`);
    this._prevDir = this.cwd;
    this.cwd = target;
    return '';
  }

  cmdLs(args) {
    const flags = args.filter(a => a.startsWith('-')).join('');
    const target = args.find(a => !a.startsWith('-'));
    const path = resolvePath(this.cwd, target || '.');
    const node = this.fs[path];
    if (!node) throw new Error(`ls: cannot access '${target}': No such file or directory`);
    if (node.type === 'file') return target || path.split('/').pop();
    const showAll = flags.includes('a');
    const longFmt = flags.includes('l');
    let items = [...node.children];
    if (showAll) items = ['.', '..', ...items];
    if (!longFmt) return items.join('  ');
    return items.map(name => {
      if (name === '.' || name === '..') return `drwxr-xr-x  2 ${this.user} ${this.user}  4096 Jan 15 10:00 ${name}`;
      const childPath = path === '/' ? `/${name}` : `${path}/${name}`;
      const child = this.fs[childPath];
      if (!child) return `?---------  ? ?     ?        ? ??? ?? ??:?? ${name}`;
      if (child.type === 'dir') return `drwxr-xr-x  ${(child.children?.length || 0) + 2} ${this.user} ${this.user}  4096 Jan 15 10:00 ${name}`;
      const size = (child.content || '').length;
      return `-rw-r--r--  1 ${this.user} ${this.user}  ${String(size).padStart(5)} Jan 15 10:00 ${name}`;
    }).join('\n');
  }

  cmdCat(args, pipeInput) {
    if (pipeInput !== null) return pipeInput;
    if (!args.length) throw new Error('cat: missing file operand');
    const showNum = args.includes('-n');
    const files = args.filter(a => !a.startsWith('-'));
    return files.map(f => {
      const path = resolvePath(this.cwd, f);
      const node = this.fs[path];
      if (!node) throw new Error(`cat: ${f}: No such file or directory`);
      if (node.type === 'dir') throw new Error(`cat: ${f}: Is a directory`);
      if (showNum) return node.content.split('\n').filter(l => l).map((l, i) => `     ${i + 1}\t${l}`).join('\n');
      return node.content.trimEnd();
    }).join('\n');
  }

  cmdHead(args, pipeInput) {
    let n = 10;
    const nIdx = args.indexOf('-n');
    if (nIdx !== -1 && args[nIdx + 1]) n = parseInt(args[nIdx + 1]);
    const text = pipeInput !== null ? pipeInput : this.getFileContent(args.find(a => !a.startsWith('-') && isNaN(a)));
    return text.split('\n').slice(0, n).join('\n');
  }

  cmdTail(args, pipeInput) {
    let n = 10;
    const nIdx = args.indexOf('-n');
    if (nIdx !== -1 && args[nIdx + 1]) n = parseInt(args[nIdx + 1]);
    const text = pipeInput !== null ? pipeInput : this.getFileContent(args.find(a => !a.startsWith('-') && isNaN(a)));
    const lines = text.split('\n').filter(l => l);
    return lines.slice(-n).join('\n');
  }

  cmdGrep(args, pipeInput) {
    const flags = args.filter(a => a.startsWith('-')).join('');
    const nonFlags = args.filter(a => !a.startsWith('-'));
    const pattern = nonFlags[0];
    if (!pattern) throw new Error('grep: missing pattern');
    const text = pipeInput !== null ? pipeInput : this.getFileContent(nonFlags[1]);
    const ignoreCase = flags.includes('i');
    const countOnly = flags.includes('c');
    const invert = flags.includes('v');
    const showNum = flags.includes('n');
    const regex = new RegExp(pattern, ignoreCase ? 'i' : '');
    let lines = text.split('\n').filter(l => l);
    lines = lines.filter(l => invert ? !regex.test(l) : regex.test(l));
    if (countOnly) return String(lines.length);
    if (showNum) return lines.map((l, i) => `${i + 1}:${l}`).join('\n');
    return lines.join('\n');
  }

  cmdAwk(rawArgs, pipeInput) {
    // Re-parse from the original input to properly extract the awk program
    // The awk program is the content between the first pair of quotes in the original command
    let delim = /\s+/;
    let program = '';
    let fileArg = null;

    // Check for -F flag
    const fIdx = rawArgs.indexOf('-F');
    if (fIdx !== -1 && rawArgs[fIdx + 1]) {
      const d = rawArgs[fIdx + 1];
      delim = new RegExp(d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    }

    // Reconstruct the full program: find args containing { and } and everything between
    const allArgs = rawArgs.filter(a => a !== '-F' && (fIdx === -1 || a !== rawArgs[fIdx + 1]));
    let braceStart = -1, braceEnd = -1;
    for (let i = 0; i < allArgs.length; i++) {
      if (allArgs[i].includes('{') && braceStart === -1) braceStart = i;
      if (allArgs[i].includes('}')) braceEnd = i;
    }

    if (braceStart !== -1 && braceEnd !== -1) {
      // Everything from braceStart to braceEnd is the program (may include condition before {)
      // Also include any condition args before the brace
      let conditionStart = braceStart;
      // Look backwards for condition like $9 == 500
      for (let i = braceStart - 1; i >= 0; i--) {
        if (allArgs[i].startsWith('$') || allArgs[i] === '==' || allArgs[i] === '!=' || allArgs[i] === '>' || allArgs[i] === '<' || allArgs[i] === '>=' || allArgs[i] === '<=' || allArgs[i] === '~' || allArgs[i] === '!~' || /^\d+$/.test(allArgs[i]) || allArgs[i].startsWith('"') || allArgs[i].startsWith('/')) {
          conditionStart = i;
        } else break;
      }
      program = allArgs.slice(conditionStart, braceEnd + 1).join(' ');
      fileArg = allArgs.find((a, idx) => idx > braceEnd && !a.startsWith('-'));
    } else {
      program = allArgs[0] || '';
      fileArg = allArgs[1];
    }

    const text = pipeInput !== null ? pipeInput : this.getFileContent(fileArg);
    const lines = text.split('\n').filter(l => l);

    // Parse awk program: condition {action}
    // Patterns: {action}, /regex/ {action}, $N == val {action}, $N > val {action}
    const condActionMatch = program.match(/^(.+?)\s*\{(.+)\}$/);
    const simpleMatch = program.match(/^\{(.+)\}$/);

    let condition = null;
    let action = 'print $0';

    if (simpleMatch) {
      action = simpleMatch[1].trim();
    } else if (condActionMatch) {
      const condStr = condActionMatch[1].trim();
      action = condActionMatch[2].trim();

      // Parse condition
      if (condStr.startsWith('/') && condStr.endsWith('/')) {
        // Regex condition: /pattern/
        condition = { type: 'regex', pattern: new RegExp(condStr.slice(1, -1)) };
      } else {
        // Field comparison: $N == val, $N > val, $N ~ /pattern/
        const compMatch = condStr.match(/^\$(\d+|NF)\s*(==|!=|>|<|>=|<=|~|!~)\s*(.+)$/);
        if (compMatch) {
          condition = { type: 'compare', field: compMatch[1], op: compMatch[2], value: compMatch[3].replace(/^["']|["']$/g, '') };
        }
      }
    }

    const results = [];
    for (const line of lines) {
      const fields = line.split(delim);

      // Check condition
      if (condition) {
        if (condition.type === 'regex' && !condition.pattern.test(line)) continue;
        if (condition.type === 'compare') {
          const fieldIdx = condition.field === 'NF' ? fields.length - 1 : parseInt(condition.field) - 1;
          const fieldVal = fields[fieldIdx] || '';
          const cmpVal = condition.value;
          let pass = false;
          switch (condition.op) {
            case '==': pass = fieldVal === cmpVal || (Number(fieldVal) === Number(cmpVal)); break;
            case '!=': pass = fieldVal !== cmpVal; break;
            case '>': pass = Number(fieldVal) > Number(cmpVal); break;
            case '<': pass = Number(fieldVal) < Number(cmpVal); break;
            case '>=': pass = Number(fieldVal) >= Number(cmpVal); break;
            case '<=': pass = Number(fieldVal) <= Number(cmpVal); break;
            case '~': pass = new RegExp(cmpVal.replace(/^\/|\/$/g, '')).test(fieldVal); break;
            case '!~': pass = !new RegExp(cmpVal.replace(/^\/|\/$/g, '')).test(fieldVal); break;
            default: break;
          }
          if (!pass) continue;
        }
      }

      // Execute action
      const printMatch = action.match(/print\s+(.+)/);
      if (printMatch) {
        const fieldRefs = printMatch[1].split(/,\s*/);
        const vals = fieldRefs.map(ref => {
          const m = ref.trim().match(/^\$(\d+|NF)$/);
          if (m) { return m[1] === 'NF' ? fields[fields.length - 1] : (fields[parseInt(m[1]) - 1] || ''); }
          return ref.replace(/"/g, '');
        });
        results.push(vals.join(' '));
      } else {
        results.push(line);
      }
    }
    return results.join('\n');
  }

  cmdSed(args, pipeInput) {
    const expr = args.find(a => a.startsWith('s') || a.includes('/'));
    if (!expr) return pipeInput || '';
    const text = pipeInput !== null ? pipeInput : this.getFileContent(args.find(a => !a.startsWith('-') && !a.startsWith('s')));
    // Handle s/old/new/g
    const sedMatch = expr.match(/^s(.)(.+?)\1(.+?)\1(g?)$/);
    if (sedMatch) {
      const [, , pattern, replacement, global] = sedMatch;
      const regex = new RegExp(pattern, global ? 'g' : '');
      return text.split('\n').map(l => l.replace(regex, replacement)).join('\n');
    }
    // Handle /pattern/d (delete)
    const delMatch = expr.match(/^\/(.+)\/d$/);
    if (delMatch) {
      const regex = new RegExp(delMatch[1]);
      return text.split('\n').filter(l => !regex.test(l)).join('\n');
    }
    return text;
  }

  cmdSort(args, pipeInput) {
    const flags = args.filter(a => a.startsWith('-')).join('');
    const text = pipeInput !== null ? pipeInput : this.getFileContent(args.find(a => !a.startsWith('-')));
    let lines = text.split('\n').filter(l => l);
    const numeric = flags.includes('n');
    const reverse = flags.includes('r');
    const unique = flags.includes('u');
    lines.sort((a, b) => {
      if (numeric) return parseFloat(a) - parseFloat(b);
      return a.localeCompare(b);
    });
    if (reverse) lines.reverse();
    if (unique) lines = [...new Set(lines)];
    return lines.join('\n');
  }

  cmdUniq(args, pipeInput) {
    const flags = args.filter(a => a.startsWith('-')).join('');
    const text = pipeInput !== null ? pipeInput : this.getFileContent(args.find(a => !a.startsWith('-')));
    const lines = text.split('\n').filter(l => l);
    const countMode = flags.includes('c');
    const dupsOnly = flags.includes('d');
    const groups = [];
    let prev = null, count = 0;
    for (const line of lines) {
      if (line === prev) { count++; } else { if (prev !== null) groups.push({ line: prev, count }); prev = line; count = 1; }
    }
    if (prev !== null) groups.push({ line: prev, count });
    let result = dupsOnly ? groups.filter(g => g.count > 1) : groups;
    if (countMode) return result.map(g => `${String(g.count).padStart(7)} ${g.line}`).join('\n');
    return result.map(g => g.line).join('\n');
  }

  cmdWc(args, pipeInput) {
    const flags = args.filter(a => a.startsWith('-')).join('');
    const text = pipeInput !== null ? pipeInput : this.getFileContent(args.find(a => !a.startsWith('-')));
    const lines = text.split('\n');
    const lineCount = lines.filter(l => l).length;
    const wordCount = text.split(/\s+/).filter(w => w).length;
    const byteCount = text.length;
    if (flags.includes('l')) return String(lineCount);
    if (flags.includes('w')) return String(wordCount);
    if (flags.includes('c')) return String(byteCount);
    return `  ${lineCount}  ${wordCount} ${byteCount}`;
  }

  cmdCut(args, pipeInput) {
    let delim = '\t';
    let fields = [];
    const dIdx = args.indexOf('-d');
    if (dIdx !== -1 && args[dIdx + 1]) delim = args[dIdx + 1];
    const fIdx = args.indexOf('-f');
    if (fIdx !== -1 && args[fIdx + 1]) fields = args[fIdx + 1].split(',').map(Number);
    const text = pipeInput !== null ? pipeInput : this.getFileContent(args.find(a => !a.startsWith('-') && !fields.includes(Number(a))));
    return text.split('\n').filter(l => l).map(line => {
      const parts = line.split(delim);
      return fields.map(f => parts[f - 1] || '').join(delim);
    }).join('\n');
  }

  cmdFind(args) {
    const path = args[0] || '.';
    const resolved = resolvePath(this.cwd, path);
    const nameIdx = args.indexOf('-name');
    const typeIdx = args.indexOf('-type');
    const namePattern = nameIdx !== -1 ? args[nameIdx + 1] : null;
    const typeFilter = typeIdx !== -1 ? args[typeIdx + 1] : null;
    const results = [];
    const walk = (p) => {
      const node = this.fs[p];
      if (!node) return;
      const name = p.split('/').pop() || '/';
      const matchesName = !namePattern || new RegExp('^' + namePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$').test(name);
      const matchesType = !typeFilter || (typeFilter === 'f' && node.type === 'file') || (typeFilter === 'd' && node.type === 'dir');
      if (matchesName && matchesType) results.push(p);
      if (node.type === 'dir' && node.children) {
        for (const child of node.children) {
          walk(p === '/' ? `/${child}` : `${p}/${child}`);
        }
      }
    };
    walk(resolved);
    return results.join('\n');
  }

  cmdTouch(args) {
    for (const name of args) {
      const path = resolvePath(this.cwd, name);
      if (!this.fs[path]) {
        this.fs[path] = { type: 'file', content: '' };
        const parent = path.substring(0, path.lastIndexOf('/')) || '/';
        if (this.fs[parent]?.children) this.fs[parent].children.push(name);
      }
    }
    return '';
  }

  cmdMkdir(args) {
    const mkParents = args.includes('-p');
    const dirs = args.filter(a => a !== '-p');
    for (const name of dirs) {
      const path = resolvePath(this.cwd, name);
      if (this.fs[path]) throw new Error(`mkdir: cannot create directory '${name}': File exists`);
      this.fs[path] = { type: 'dir', children: [] };
      const parent = path.substring(0, path.lastIndexOf('/')) || '/';
      if (this.fs[parent]?.children) this.fs[parent].children.push(path.split('/').pop());
    }
    return '';
  }

  cmdRm(args) {
    const recursive = args.some(a => a.includes('r'));
    const files = args.filter(a => !a.startsWith('-'));
    for (const name of files) {
      const path = resolvePath(this.cwd, name);
      const node = this.fs[path];
      if (!node) throw new Error(`rm: cannot remove '${name}': No such file or directory`);
      if (node.type === 'dir' && !recursive) throw new Error(`rm: cannot remove '${name}': Is a directory`);
      delete this.fs[path];
      const parent = path.substring(0, path.lastIndexOf('/')) || '/';
      if (this.fs[parent]?.children) {
        this.fs[parent].children = this.fs[parent].children.filter(c => c !== path.split('/').pop());
      }
    }
    return '';
  }

  cmdCp(args) {
    const files = args.filter(a => !a.startsWith('-'));
    if (files.length < 2) throw new Error('cp: missing destination');
    const src = resolvePath(this.cwd, files[0]);
    const dst = resolvePath(this.cwd, files[1]);
    const node = this.fs[src];
    if (!node) throw new Error(`cp: cannot stat '${files[0]}': No such file or directory`);
    this.fs[dst] = { ...node, content: node.content };
    const parent = dst.substring(0, dst.lastIndexOf('/')) || '/';
    if (this.fs[parent]?.children) this.fs[parent].children.push(dst.split('/').pop());
    return '';
  }

  cmdMv(args) {
    const files = args.filter(a => !a.startsWith('-'));
    if (files.length < 2) throw new Error('mv: missing destination');
    this.cmdCp(args);
    this.cmdRm([files[0]]);
    return '';
  }

  // ── System commands ───────────────────────────────────────────────────────
  cmdPs(args) {
    const flags = args.join('');
    if (flags.includes('aux') || flags.includes('ef')) {
      return `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 169316 11200 ?        Ss   Jan14   0:05 /sbin/init
root       234  0.0  0.2 274816 18432 ?        Ss   Jan14   0:12 /usr/lib/systemd/systemd-journald
root       456  0.0  0.1  72300  5632 ?        Ss   Jan14   0:03 /usr/sbin/sshd -D
nginx     1234  0.5  0.3 145920 24576 ?        S    10:00   0:45 nginx: worker process
nginx     1235  0.4  0.3 145920 23552 ?        S    10:00   0:42 nginx: worker process
ubuntu    2345 12.3  4.5 2345678 368640 ?      Sl   10:05   5:23 java -jar /opt/app/myapp.jar
ubuntu    2567  0.1  0.2  45678 16384 pts/0    Ss   10:30   0:01 -bash
postgres  3456  2.1  1.8 567890 147456 ?       Ss   Jan14   8:45 /usr/lib/postgresql/15/bin/postgres
redis     4567  0.8  0.5  78901 40960 ?        Ssl  Jan14   3:21 /usr/bin/redis-server 127.0.0.1:6379
root      5678  0.0  0.0  12345  2048 ?        S    10:00   0:00 /usr/sbin/cron -f`;
    }
    return `  PID TTY          TIME CMD\n 2567 pts/0    00:00:01 bash\n 9999 pts/0    00:00:00 ps`;
  }

  cmdTop() {
    return `top - 14:30:00 up 45 days,  3:22,  2 users,  load average: 1.23, 0.98, 0.76
Tasks: 156 total,   2 running, 153 sleeping,   0 stopped,   1 zombie
%Cpu(s): 15.2 us,  3.1 sy,  0.0 ni, 80.5 id,  1.0 wa,  0.0 hi,  0.2 si
MiB Mem :  16000.0 total,   1205.3 free,   8234.5 used,   6560.2 buff/cache
MiB Swap:   4000.0 total,   3500.0 free,    500.0 used.   7480.1 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 2345 ubuntu    20   0 2345678 368640  12345 S  12.3   4.5   5:23.45 java
 3456 postgres  20   0  567890 147456   8901 S   2.1   1.8   8:45.12 postgres
 1234 nginx     20   0  145920  24576   4567 S   0.5   0.3   0:45.67 nginx
 4567 redis     20   0   78901  40960   3456 S   0.8   0.5   3:21.89 redis-server
    1 root      20   0  169316  11200   8192 S   0.0   0.1   0:05.23 systemd

(simulated — press q to exit in real top)`;
  }

  cmdDf(args) {
    const human = args.includes('-h');
    const inodes = args.includes('-i');
    if (inodes) return `Filesystem      Inodes  IUsed   IFree IUse% Mounted on
/dev/sda1      3276800 234567 3042233    8% /
tmpfs          2048000      5 2047995    1% /tmp`;
    if (human) return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   35G   15G  70% /
/dev/sdb1       100G   80G   20G  80% /data
tmpfs           7.8G  256M  7.6G   4% /tmp
/dev/sdc1       200G  150G   50G  75% /var/log`;
    return `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       52428800 36700160  15728640  70% /`;
  }

  cmdDu(args) {
    const human = args.includes('-h') || args.includes('-sh');
    const target = args.find(a => !a.startsWith('-')) || '.';
    const path = resolvePath(this.cwd, target);
    const node = this.fs[path];
    if (!node) throw new Error(`du: cannot access '${target}': No such file or directory`);
    if (node.type === 'file') return human ? `${Math.ceil((node.content || '').length / 1024)}K\t${target}` : `${(node.content || '').length}\t${target}`;
    if (args.includes('-sh') || args.includes('-s')) return human ? '4.2M\t' + target : '4300\t' + target;
    const results = [];
    if (node.children) {
      for (const child of node.children) {
        const childPath = path === '/' ? `/${child}` : `${path}/${child}`;
        const childNode = this.fs[childPath];
        if (childNode?.type === 'dir') results.push(human ? `1.2M\t${child}` : `1200\t${child}`);
        else if (childNode?.type === 'file') results.push(human ? `${Math.ceil((childNode.content || '').length / 1024)}K\t${child}` : `${(childNode.content || '').length}\t${child}`);
      }
    }
    results.push(human ? '4.2M\t.' : '4300\t.');
    return results.join('\n');
  }

  cmdFree(args) {
    const human = args.includes('-h') || args.includes('-m');
    if (human) return `               total        used        free      shared  buff/cache   available
Mem:           16Gi       8.0Gi       1.2Gi       256Mi       6.4Gi       7.3Gi
Swap:          4.0Gi       500Mi       3.5Gi`;
    return `               total        used        free      shared  buff/cache   available
Mem:        16384000     8388608     1234567      262144     6553600     7654321
Swap:        4096000      512000     3584000`;
  }

  cmdPing(args) {
    const host = args.find(a => !a.startsWith('-')) || 'localhost';
    return `PING ${host} (93.184.216.34) 56(84) bytes of data.
64 bytes from 93.184.216.34: icmp_seq=1 ttl=56 time=12.3 ms
64 bytes from 93.184.216.34: icmp_seq=2 ttl=56 time=11.8 ms
64 bytes from 93.184.216.34: icmp_seq=3 ttl=56 time=12.1 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 11.8/12.1/12.3/0.2 ms`;
  }

  cmdCurl(args) {
    const url = args.find(a => !a.startsWith('-')) || '';
    if (url.includes('health')) return '{"status":"ok"}';
    if (url.includes('users')) return '{"users":["alice","bob","charlie"]}';
    return `<!DOCTYPE html>\n<html><body><h1>200 OK</h1></body></html>`;
  }

  cmdSs(args) {
    const flags = args.join('');
    if (flags.includes('t') && flags.includes('l')) {
      return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port  Process
LISTEN   0        128      0.0.0.0:22          0.0.0.0:*          sshd
LISTEN   0        511      0.0.0.0:80          0.0.0.0:*          nginx
LISTEN   0        128      127.0.0.1:5432      0.0.0.0:*          postgres
LISTEN   0        128      127.0.0.1:6379      0.0.0.0:*          redis-server
LISTEN   0        128      127.0.0.1:8080      0.0.0.0:*          java`;
    }
    if (flags.includes('s')) {
      return `Total: 234\nTCP:   189 (estab 145, closed 12, orphaned 0, timewait 32)\nUDP:   8`;
    }
    return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
ESTAB    0        0        10.0.0.5:22         10.0.0.1:52341
ESTAB    0        0        10.0.0.5:80         192.168.1.10:45678`;
  }

  cmdNslookup(args) {
    const host = args[0] || 'localhost';
    return `Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\nNon-authoritative answer:\nName:\t${host}\nAddress: 93.184.216.34`;
  }

  cmdUname(args) {
    const flags = args.join('');
    if (flags.includes('a')) return 'Linux codementee 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
    if (flags.includes('r')) return '5.15.0-91-generic';
    if (flags.includes('m')) return 'x86_64';
    return 'Linux';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getFileContent(filename) {
    if (!filename) throw new Error('missing file operand');
    const path = resolvePath(this.cwd, filename);
    const node = this.fs[path];
    if (!node) throw new Error(`${filename}: No such file or directory`);
    if (node.type === 'dir') throw new Error(`${filename}: Is a directory`);
    return node.content.trimEnd();
  }

  cmdHelp() {
    return `Available commands:
  Navigation:  pwd, cd, ls
  Files:       cat, head, tail, touch, cp, mv, rm, mkdir, find
  Text:        grep, sed, awk, sort, uniq, wc, cut, echo
  System:      ps, top, df, du, free, uname, uptime, nproc, whoami, hostname, id
  Network:     ping, curl, ss, netstat, nslookup
  Other:       history, clear, help, exit

Sample files to explore:
  /var/log/nginx/access.log  — Web server access log (practice grep, awk, sort)
  /var/log/syslog            — System log (practice grep, tail)
  /var/log/auth.log          — Auth log (find failed logins)
  /etc/passwd                — User accounts (practice cut, awk)
  /tmp/data.csv              — CSV data (practice cut, awk, sort)
  /home/ubuntu/projects/     — Sample project files

Try these:
  grep "500" /var/log/nginx/access.log
  awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
  cat /etc/passwd | cut -d: -f1
  ps aux | grep java
  df -h`;
  }

  reset() {
    this.fs = JSON.parse(JSON.stringify(INITIAL_FS));
    this.cwd = '/home/ubuntu';
    this.history = [];
  }
}
