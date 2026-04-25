# Linux Course for DevOps & SRE — Codementee

**URL:** https://codementee.io/learn/linux  
**Price:** Free with login  
**Level:** Beginner to Advanced  
**Topics:** 33  
**Includes:** 7-Day Quick Start + 2-Week Advanced Roadmap + Interactive Playground

## What You'll Learn

A complete Linux course for DevOps and SRE engineers. Covers everything from the kernel and file system to production debugging with grep, sed, awk, and real-world scenarios.

## 7-Day Quick Start Roadmap

- **Day 1:** Linux basics + navigation (pwd, ls, cd, cat, head, tail)
- **Day 2:** Users, permissions, ownership (chmod, chown)
- **Day 3:** Processes & monitoring (ps, top, kill)
- **Day 4:** Memory + disk management (free, df, du)
- **Day 5:** Networking (ping, curl, ss, nslookup)
- **Day 6:** Logs + debugging (tail -f, grep, journalctl)
- **Day 7:** Real troubleshooting scenarios

## Course Sections

### Fundamentals
- What is Linux? (kernel, shell, distributions)
- The Linux File System (/, /etc, /var, /proc, inodes)
- Shell Basics (stdin/stdout/stderr, pipes, redirection, environment variables)

### Essential Commands
- Navigation (pwd, cd, ls, mkdir, rmdir)
- File Management (cp, scp, mv, rm, touch, find)
- Viewing Files (cat, head, tail, less, more)
- System Information (uname, df, free, uptime, ps, nproc)

### Text Processing (grep, sed, awk)
- grep — pattern matching, regex (BRE and ERE), real-world log analysis
- sed — find-and-replace, deletion, insertion, in-place editing
- awk — field extraction, conditions, log analysis one-liners
- sort, uniq, wc — sorting, deduplication, counting
- cut and pipe mastery — field extraction, building one-liners

### System Administration
- File Permissions (chmod, chown, SUID, SGID, sticky bit)
- Users & Groups (useradd, passwd, sudo, /etc/passwd, /etc/shadow)
- Process Management (ps, top, htop, kill, process states, zombies, D-state)
- Services & systemd (systemctl, journalctl, unit files)
- Disk Management (df, du, iostat, iotop, inode exhaustion)

### Networking
- Networking Commands (ping, curl, ss, netstat, traceroute, ip)
- DNS Debugging (nslookup, dig, /etc/resolv.conf)
- Firewall & Security (ufw, iptables, SSH hardening)

### Shell Scripting
- Scripting Basics (variables, conditionals, loops, functions, set -euo pipefail)
- Real-World Scripts (deployment scripts, log analysis, interview one-liners)

### 44 MAANG Interview Questions
- CPU troubleshooting (8 questions)
- Memory troubleshooting (7 questions)
- Disk & storage (7 questions)
- Network debugging (8 questions)
- Permissions & access (4 questions)
- Process management (6 questions)
- Log analysis (4 questions)

### 8 Production Scenarios
- Sudden traffic spike → app failing
- Disk full but no large files visible
- Random crashes → OOM killer
- Service not reachable
- Application suddenly slow
- CI/CD pipeline failing
- Permission denied errors
- System breaks after deployment

## Linux Playground

Interactive simulated terminal at https://codementee.io/learn/linux/playground

Practice commands with pre-loaded sample data:
- `/var/log/nginx/access.log` — web server access log
- `/var/log/auth.log` — authentication log
- `/etc/passwd` — user accounts
- `/tmp/data.csv` — CSV data for awk practice
- `/home/ubuntu/projects/` — sample Python app

Supports: ls, cat, grep, sed, awk, sort, uniq, wc, cut, find, ps, df, du, free, ping, curl, ss, nslookup, and more.

---
*Codementee — MAANG Interview Prep Platform*  
*https://codementee.io*
