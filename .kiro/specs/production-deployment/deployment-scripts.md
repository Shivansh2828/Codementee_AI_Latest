# Deployment Scripts and Automation

## Server Setup Scripts

### 1. Initial Server Setup Script

```bash
#!/bin/bash
# setup-server.sh - Initial VPS setup for Codementee production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

log "Starting Codementee production server setup..."

# Update system
log "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
log "Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    htop \
    nginx \
    redis-server \
    supervisor \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
log "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
log "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js 18 LTS
log "Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
log "Installing Python 3.11..."
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Create application user and directories
log "Creating application user and directories..."
sudo useradd -m -s /bin/bash codementee
sudo usermod -aG docker codementee

# Create application directories
sudo mkdir -p /var/www/codementee
sudo mkdir -p /var/log/codementee
sudo mkdir -p /var/backups/codementee
sudo mkdir -p /etc/codementee

# Set permissions
sudo chown -R codementee:codementee /var/www/codementee
sudo chown -R codementee:codementee /var/log/codementee
sudo chown -R codementee:codementee /var/backups/codementee

# Configure firewall
log "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Configure fail2ban
log "Configuring fail2ban..."
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure Redis
log "Configuring Redis..."
sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
sudo systemctl enable redis-server
sudo systemctl restart redis-server

# Create swap file (if not exists)
if [ ! -f /swapfile ]; then
    log "Creating swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Install monitoring tools
log "Installing monitoring tools..."
# Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
rm -rf node_exporter-1.6.1.linux-amd64*

# Create systemd service for node_exporter
sudo tee /etc/systemd/system/node_exporter.service > /dev/null <<EOF
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=nobody
Group=nobody
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter

log "Server setup completed successfully!"
log "Please log out and log back in to apply Docker group membership."
log "Next steps:"
log "1. Configure domain DNS to point to this server"
log "2. Run SSL certificate setup"
log "3. Deploy the application"
```

### 2. SSL Certificate Setup Script

```bash
#!/bin/bash
# setup-ssl.sh - SSL certificate setup for Codementee

set -e

DOMAIN="codementee.io"
EMAIL="admin@codementee.io"

log() {
    echo -e "\033[0;32m[$(date +'%Y-%m-%d %H:%M:%S')] $1\033[0m"
}

error() {
    echo -e "\033[0;31m[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1\033[0m"
    exit 1
}

# Check if domain resolves to this server
log "Checking domain resolution..."
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    warn "Domain $DOMAIN does not resolve to this server IP ($SERVER_IP)"
    warn "Current domain IP: $DOMAIN_IP"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stop nginx if running
sudo systemctl stop nginx 2>/dev/null || true

# Obtain SSL certificate
log "Obtaining SSL certificate for $DOMAIN and www.$DOMAIN..."
sudo certbot certonly --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN

# Set up automatic renewal
log "Setting up automatic certificate renewal..."
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

# Create nginx SSL configuration
log "Creating nginx SSL configuration..."
sudo tee /etc/nginx/sites-available/codementee > /dev/null <<EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN api.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Placeholder for application
    location / {
        return 200 "SSL setup complete. Application deployment pending.";
        add_header Content-Type text/plain;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# API server
server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL configuration (same as above)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Placeholder for API
    location / {
        return 200 "API SSL setup complete. Application deployment pending.";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/codementee /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

log "SSL setup completed successfully!"
log "Certificates installed for:"
log "- $DOMAIN"
log "- www.$DOMAIN"
log "- api.$DOMAIN"
log "Automatic renewal configured."
```

### 3. Application Deployment Script

```bash
#!/bin/bash
# deploy-app.sh - Deploy Codementee application

set -e

# Configuration
REPO_URL="https://github.com/your-org/codementee.git"
DEPLOY_DIR="/var/www/codementee"
BACKUP_DIR="/var/backups/codementee"
LOG_FILE="/var/log/codementee/deploy.log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check if running as codementee user
if [ "$USER" != "codementee" ]; then
    error "This script must be run as the codementee user"
fi

# Create log file
mkdir -p $(dirname $LOG_FILE)
touch $LOG_FILE

log "Starting Codementee application deployment..."

# Create backup of current deployment
if [ -d "$DEPLOY_DIR/current" ]; then
    log "Creating backup of current deployment..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    cp -r "$DEPLOY_DIR/current" "$BACKUP_DIR/$BACKUP_NAME"
    log "Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Clone or update repository
if [ ! -d "$DEPLOY_DIR/repo" ]; then
    log "Cloning repository..."
    git clone $REPO_URL "$DEPLOY_DIR/repo"
else
    log "Updating repository..."
    cd "$DEPLOY_DIR/repo"
    git fetch origin
    git reset --hard origin/main
fi

cd "$DEPLOY_DIR/repo"

# Check for environment file
if [ ! -f ".env.production" ]; then
    error "Environment file .env.production not found!"
fi

# Build frontend
log "Building frontend..."
cd frontend
npm ci --production
npm run build
cd ..

# Prepare new deployment directory
log "Preparing deployment..."
DEPLOY_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
NEW_DEPLOY_DIR="$DEPLOY_DIR/releases/$DEPLOY_TIMESTAMP"
mkdir -p "$NEW_DEPLOY_DIR"

# Copy application files
cp -r backend "$NEW_DEPLOY_DIR/"
cp -r frontend/build "$NEW_DEPLOY_DIR/frontend/"
cp docker-compose.prod.yml "$NEW_DEPLOY_DIR/"
cp .env.production "$NEW_DEPLOY_DIR/.env"

# Set up Python virtual environment
log "Setting up Python environment..."
cd "$NEW_DEPLOY_DIR/backend"
python3.11 -m venv venv
source venv/bin/activate
pip install --no-cache-dir -r requirements.txt

# Build and start Docker containers
log "Building and starting Docker containers..."
cd "$NEW_DEPLOY_DIR"
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Health check
log "Performing health check..."
sleep 30
for i in {1..10}; do
    if curl -f http://localhost:8001/health > /dev/null 2>&1; then
        log "Health check passed"
        break
    fi
    if [ $i -eq 10 ]; then
        error "Health check failed after 10 attempts"
    fi
    log "Health check attempt $i failed, retrying..."
    sleep 10
done

# Update symlink to new deployment
log "Updating current deployment symlink..."
ln -sfn "$NEW_DEPLOY_DIR" "$DEPLOY_DIR/current"

# Update nginx configuration
log "Updating nginx configuration..."
sudo tee /etc/nginx/sites-available/codementee > /dev/null <<EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name codementee.io www.codementee.io api.codementee.io;
    return 301 https://\$server_name\$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name codementee.io www.codementee.io;

    ssl_certificate /etc/letsencrypt/live/codementee.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codementee.io/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend (React SPA)
    location / {
        root $DEPLOY_DIR/current/frontend;
        index index.html;
        try_files \$uri \$uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# API server
server {
    listen 443 ssl http2;
    server_name api.codementee.io;

    ssl_certificate /etc/letsencrypt/live/codementee.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codementee.io/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

    # API endpoints
    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Login endpoint with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://localhost:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx

# Clean up old releases (keep last 5)
log "Cleaning up old releases..."
cd "$DEPLOY_DIR/releases"
ls -t | tail -n +6 | xargs -r rm -rf

# Stop old containers
log "Cleaning up old Docker containers..."
docker system prune -f

log "Deployment completed successfully!"
log "Application is now live at https://codementee.io"
log "API is available at https://api.codementee.io"
```

### 4. Rollback Script

```bash
#!/bin/bash
# rollback.sh - Rollback to previous deployment

set -e

DEPLOY_DIR="/var/www/codementee"
LOG_FILE="/var/log/codementee/rollback.log"

log() {
    echo -e "\033[0;32m[$(date +'%Y-%m-%d %H:%M:%S')] $1\033[0m" | tee -a $LOG_FILE
}

error() {
    echo -e "\033[0;31m[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1\033[0m" | tee -a $LOG_FILE
    exit 1
}

# Check if running as codementee user
if [ "$USER" != "codementee" ]; then
    error "This script must be run as the codementee user"
fi

log "Starting rollback process..."

# Find previous release
cd "$DEPLOY_DIR/releases"
RELEASES=($(ls -t))

if [ ${#RELEASES[@]} -lt 2 ]; then
    error "No previous release found for rollback"
fi

CURRENT_RELEASE=$(basename $(readlink "$DEPLOY_DIR/current"))
PREVIOUS_RELEASE=""

for release in "${RELEASES[@]}"; do
    if [ "$release" != "$CURRENT_RELEASE" ]; then
        PREVIOUS_RELEASE="$release"
        break
    fi
done

if [ -z "$PREVIOUS_RELEASE" ]; then
    error "Could not determine previous release"
fi

log "Rolling back from $CURRENT_RELEASE to $PREVIOUS_RELEASE"

# Stop current containers
log "Stopping current containers..."
cd "$DEPLOY_DIR/current"
docker-compose -f docker-compose.prod.yml down

# Switch to previous release
log "Switching to previous release..."
ln -sfn "$DEPLOY_DIR/releases/$PREVIOUS_RELEASE" "$DEPLOY_DIR/current"

# Start previous release containers
log "Starting previous release containers..."
cd "$DEPLOY_DIR/current"
docker-compose -f docker-compose.prod.yml up -d

# Health check
log "Performing health check..."
sleep 30
for i in {1..10}; do
    if curl -f http://localhost:8001/health > /dev/null 2>&1; then
        log "Health check passed"
        break
    fi
    if [ $i -eq 10 ]; then
        error "Health check failed after rollback"
    fi
    log "Health check attempt $i failed, retrying..."
    sleep 10
done

log "Rollback completed successfully!"
log "Application rolled back to release: $PREVIOUS_RELEASE"
```

### 5. Monitoring Setup Script

```bash
#!/bin/bash
# setup-monitoring.sh - Set up monitoring stack

set -e

log() {
    echo -e "\033[0;32m[$(date +'%Y-%m-%d %H:%M:%S')] $1\033[0m"
}

log "Setting up monitoring stack..."

# Create monitoring directory
sudo mkdir -p /opt/monitoring
cd /opt/monitoring

# Create Prometheus configuration
sudo tee prometheus.yml > /dev/null <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'codementee-backend'
    static_configs:
      - targets: ['localhost:8001']
    metrics_path: '/metrics'

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
EOF

# Create alert rules
sudo tee alert_rules.yml > /dev/null <<EOF
groups:
- name: codementee_alerts
  rules:
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is above 80% for more than 5 minutes"

  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is above 85% for more than 5 minutes"

  - alert: ApplicationDown
    expr: up{job="codementee-backend"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Codementee application is down"
      description: "The Codementee backend application is not responding"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is above 500ms"
EOF

# Create Docker Compose for monitoring stack
sudo tee docker-compose.monitoring.yml > /dev/null <<EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
EOF

# Create Alertmanager configuration
sudo tee alertmanager.yml > /dev/null <<EOF
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@codementee.io'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  email_configs:
  - to: 'admin@codementee.io'
    subject: 'Codementee Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF

# Start monitoring stack
log "Starting monitoring stack..."
sudo docker-compose -f docker-compose.monitoring.yml up -d

log "Monitoring setup completed!"
log "Prometheus: http://localhost:9090"
log "Grafana: http://localhost:3001 (admin/admin123)"
log "Alertmanager: http://localhost:9093"
```

These deployment scripts provide a comprehensive automation framework for setting up and managing the Codementee production environment on Hostinger VPS infrastructure.