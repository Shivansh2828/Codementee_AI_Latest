"""
Real Linux Terminal Service
Uses docker exec with PTY for proper shell support (pipes, redirects, etc.)
Each user gets an isolated Alpine container. Sessions auto-expire after inactivity.
"""
import asyncio
import uuid
import time
import logging
import os
import subprocess
import threading
from typing import Dict, Optional

logger = logging.getLogger(__name__)

IDLE_TIMEOUT = 600       # 10 minutes
MAX_SESSIONS = 50
SESSION_MEM_LIMIT = "128m"
SESSION_CPU_QUOTA = 50000  # 50% of one CPU

DOCKER_IMAGE = "codementee-playground:latest"


class TerminalSession:
    def __init__(self, session_id: str, user_id: str):
        self.session_id = session_id
        self.user_id = user_id
        self.container_name = f"playground_{session_id[:12]}"
        self.process: Optional[asyncio.subprocess.Process] = None
        self.last_activity = time.time()
        self.active = False

    def touch(self):
        self.last_activity = time.time()

    def is_idle(self) -> bool:
        return time.time() - self.last_activity > IDLE_TIMEOUT


class TerminalManager:
    def __init__(self):
        self._sessions: Dict[str, TerminalSession] = {}
        self._cleanup_task: Optional[asyncio.Task] = None

    async def start(self):
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())
        await asyncio.get_event_loop().run_in_executor(None, self._ensure_image)

    def _ensure_image(self):
        """Build the playground Docker image if it doesn't exist."""
        result = subprocess.run(
            ["docker", "image", "inspect", DOCKER_IMAGE],
            capture_output=True
        )
        if result.returncode == 0:
            logger.info(f"Docker image {DOCKER_IMAGE} already exists")
            return

        logger.info(f"Building Docker image {DOCKER_IMAGE}...")
        dockerfile = """FROM alpine:3.19
RUN apk add --no-cache \\
    bash curl wget vim nano git \\
    python3 grep sed gawk coreutils util-linux \\
    procps net-tools iputils \\
    htop tree jq zip unzip tar \\
    ca-certificates

RUN adduser -D -s /bin/bash playground

# Sample practice files
RUN mkdir -p /home/playground
RUN printf 'Jan 15 10:00:01 server sshd: Accepted publickey for ubuntu\\nJan 15 10:05:23 server kernel: TCP SYN flooding on port 80\\nJan 15 10:10:45 server sshd: Failed password for root from 203.0.113.10\\nJan 15 10:15:02 server CRON: CMD cleanup.sh\\nJan 15 10:20:18 server nginx: upstream timed out\\nJan 15 10:25:33 server kernel: Out of memory: Kill process java\\nJan 15 10:30:01 server systemd: Starting Cleanup\\nJan 15 10:35:44 server sshd: Failed password for admin from 203.0.113.50\\nJan 15 10:40:12 server nginx: worker connections are not enough\\nJan 15 10:45:55 server kernel: EXT4-fs warning: maximal mount count reached\\n' > /home/playground/syslog.txt

RUN printf '192.168.1.10 - - [15/Jan/2024] "GET /api/users HTTP/1.1" 200 1234\\n192.168.1.20 - - [15/Jan/2024] "POST /api/orders HTTP/1.1" 201 567\\n192.168.1.10 - - [15/Jan/2024] "POST /api/checkout HTTP/1.1" 500 89\\n203.0.113.50 - - [15/Jan/2024] "GET /admin HTTP/1.1" 403 120\\n192.168.1.30 - - [15/Jan/2024] "GET /api/users HTTP/1.1" 200 1234\\n192.168.1.10 - - [15/Jan/2024] "POST /api/checkout HTTP/1.1" 500 89\\n192.168.1.40 - - [15/Jan/2024] "GET /api/products HTTP/1.1" 200 8901\\n10.0.0.5 - - [15/Jan/2024] "GET /health HTTP/1.1" 200 15\\n192.168.1.50 - - [15/Jan/2024] "POST /api/login HTTP/1.1" 401 45\\n192.168.1.20 - - [15/Jan/2024] "GET /api/products HTTP/1.1" 200 8901\\n' > /home/playground/access.log

RUN printf 'name,age,city,salary\\nalice,30,new york,95000\\nbob,25,san francisco,85000\\ncharlie,35,seattle,110000\\ndiana,28,austin,78000\\neve,32,boston,102000\\nfrank,40,chicago,120000\\ngrace,27,denver,88000\\nhenry,33,portland,97000\\n' > /home/playground/data.csv

RUN printf '#!/bin/bash\\nset -e\\nAPP="myapp"\\necho "Deploying $APP..."\\necho "Pulling latest image..."\\necho "Restarting services..."\\necho "Running health check..."\\necho "Deploy complete!"\\n' > /home/playground/deploy.sh && chmod +x /home/playground/deploy.sh

RUN printf 'server {\\n    listen 80;\\n    server_name myapp.com;\\n    location / {\\n        proxy_pass http://127.0.0.1:8080;\\n    }\\n    location /health {\\n        return 200 "ok";\\n    }\\n}\\n' > /home/playground/nginx.conf

RUN printf '#!/usr/bin/env python3\\nimport sys\\n\\ndef count_words(text):\\n    return len(text.split())\\n\\nif __name__ == "__main__":\\n    for line in sys.stdin:\\n        print(count_words(line.strip()))\\n' > /home/playground/wordcount.py

RUN printf '# .bashrc\\nexport PS1="\\\\u@codementee:\\\\w\\\\$ "\\nalias ll="ls -la"\\nalias la="ls -la"\\necho ""\\necho "  Welcome to Codementee Linux Playground!"\\necho "  Files available: syslog.txt, access.log, data.csv, deploy.sh, nginx.conf, wordcount.py"\\necho "  Type a command to get started. Try: ls, cat syslog.txt, grep \\"error\\" syslog.txt"\\necho ""\\n' > /home/playground/.bashrc

RUN chown -R playground:playground /home/playground

WORKDIR /home/playground
USER playground
ENV HOME=/home/playground TERM=xterm-256color SHELL=/bin/bash
CMD ["/bin/bash", "--login"]
"""
        # Write Dockerfile to temp location and build
        import tempfile
        with tempfile.TemporaryDirectory() as tmpdir:
            df_path = os.path.join(tmpdir, "Dockerfile")
            with open(df_path, "w") as f:
                f.write(dockerfile)
            result = subprocess.run(
                ["docker", "build", "-t", DOCKER_IMAGE, tmpdir],
                capture_output=True, text=True
            )
            if result.returncode != 0:
                raise RuntimeError(f"Docker build failed: {result.stderr}")
        logger.info(f"Docker image {DOCKER_IMAGE} built successfully")

    async def create_session(self, user_id: str) -> str:
        if len(self._sessions) >= MAX_SESSIONS:
            raise RuntimeError("Maximum concurrent sessions reached. Please try again later.")

        session_id = str(uuid.uuid4())
        session = TerminalSession(session_id, user_id)

        # Start container
        await asyncio.get_event_loop().run_in_executor(None, self._start_container, session)

        # Open a bash process inside the container via docker exec with PTY
        process = await asyncio.create_subprocess_exec(
            "docker", "exec", "-it", session.container_name,
            "/bin/bash", "--login",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )
        session.process = process
        session.active = True
        self._sessions[session_id] = session
        return session_id

    def _start_container(self, session: TerminalSession):
        """Start a detached container that stays alive."""
        # Remove any existing container with same name
        subprocess.run(
            ["docker", "rm", "-f", session.container_name],
            capture_output=True
        )
        result = subprocess.run([
            "docker", "run", "-d",
            "--name", session.container_name,
            "--memory", SESSION_MEM_LIMIT,
            "--cpu-quota", str(SESSION_CPU_QUOTA),
            "--network", "none",
            "--security-opt", "no-new-privileges",
            "--cap-drop", "ALL",
            "--rm",
            DOCKER_IMAGE,
            "sleep", "infinity"   # keep container alive
        ], capture_output=True, text=True)

        if result.returncode != 0:
            raise RuntimeError(f"Failed to start container: {result.stderr}")
        logger.info(f"Container {session.container_name} started")

    async def attach_websocket(self, session_id: str, websocket):
        """Bridge WebSocket ↔ docker exec PTY session."""
        session = self._sessions.get(session_id)
        if not session or not session.active:
            await websocket.send_text("\r\nSession not found or expired.\r\n")
            await websocket.close()
            return

        # Spawn a new docker exec with PTY for this websocket connection
        import pty as pty_module
        import os as os_module

        master_fd, slave_fd = pty_module.openpty()

        proc = await asyncio.create_subprocess_exec(
            "docker", "exec", "-it", session.container_name,
            "/bin/bash", "--login",
            stdin=slave_fd,
            stdout=slave_fd,
            stderr=slave_fd,
            close_fds=True,
        )
        os_module.close(slave_fd)

        session.touch()
        loop = asyncio.get_event_loop()

        async def container_to_ws():
            """Read from container PTY → send to browser."""
            while True:
                try:
                    data = await loop.run_in_executor(
                        None, lambda: os_module.read(master_fd, 4096)
                    )
                    if not data:
                        break
                    await websocket.send_bytes(data)
                    session.touch()
                except OSError:
                    break
                except Exception as e:
                    logger.debug(f"container_to_ws error: {e}")
                    break

        async def ws_to_container():
            """Read from browser → write to container PTY."""
            from fastapi import WebSocketDisconnect
            import json
            while True:
                try:
                    msg = await websocket.receive()
                    if "bytes" in msg:
                        data = msg["bytes"]
                        await loop.run_in_executor(None, lambda: os_module.write(master_fd, data))
                        session.touch()
                    elif "text" in msg:
                        text = msg["text"]
                        try:
                            parsed = json.loads(text)
                            if parsed.get("type") == "resize":
                                rows = parsed.get("rows", 24)
                                cols = parsed.get("cols", 80)
                                await self._resize_pty(master_fd, rows, cols)
                        except Exception:
                            data = text.encode()
                            await loop.run_in_executor(None, lambda: os_module.write(master_fd, data))
                        session.touch()
                    else:
                        break
                except WebSocketDisconnect:
                    break
                except Exception as e:
                    logger.debug(f"ws_to_container error: {e}")
                    break

        read_task = asyncio.create_task(container_to_ws())
        write_task = asyncio.create_task(ws_to_container())

        done, pending = await asyncio.wait(
            [read_task, write_task],
            return_when=asyncio.FIRST_COMPLETED
        )
        for task in pending:
            task.cancel()

        try:
            os_module.close(master_fd)
        except Exception:
            pass
        try:
            proc.kill()
        except Exception:
            pass

    async def _resize_pty(self, fd: int, rows: int, cols: int):
        """Send TIOCSWINSZ to resize the PTY."""
        import fcntl
        import termios
        import struct
        import os as os_module
        winsize = struct.pack("HHHH", rows, cols, 0, 0)
        try:
            fcntl.ioctl(fd, termios.TIOCSWINSZ, winsize)
        except Exception:
            pass

    async def destroy_session(self, session_id: str):
        session = self._sessions.pop(session_id, None)
        if not session:
            return
        session.active = False
        await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: subprocess.run(
                ["docker", "rm", "-f", session.container_name],
                capture_output=True
            )
        )
        logger.info(f"Session {session_id[:8]} destroyed")

    async def _cleanup_loop(self):
        while True:
            await asyncio.sleep(60)
            idle = [sid for sid, s in list(self._sessions.items()) if s.is_idle()]
            for sid in idle:
                logger.info(f"Cleaning up idle session {sid[:8]}")
                await self.destroy_session(sid)

    def session_count(self) -> int:
        return len(self._sessions)


terminal_manager = TerminalManager()
