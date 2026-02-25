# Deployment Guide for Contabo VPS

## 1. Provision a VPS

- Sign up at **Contabo** and create a new VPS (Ubuntu 22.04 LTS is recommended).
- Choose a plan with at least **2 GB RAM** and **2 CPU cores** (the "Cloud VPS S" is a good baseline).
- Note the **public IP address** and **root password** (or SSH key) provided.

## 2. Connect to the VPS

```bash
ssh root@<YOUR_VPS_IP>
# or, if you uploaded an SSH key:
ssh -i ~/.ssh/your_key.pem root@<YOUR_VPS_IP>
```

## 3. Update the system

```bash
apt update && apt upgrade -y
```

## 4. Install required packages

```bash
# Basic utilities
apt install -y curl gnupg2 ca-certificates lsb-release apt-transport-https software-properties-common

# Node.js (v20) – using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 to keep the backend alive
npm install -g pm2

# MySQL (optional – if you use MySQL locally)
apt install -y mysql-server

# MongoDB (optional – if you use MongoDB locally)
# Follow official MongoDB install guide for Ubuntu 22.04
```

## 5. Create a non‑root user (recommended)

```bash
adduser mailsender
usermod -aG sudo mailsender
# Switch to the new user
su - mailsender
```

## 6. Clone the project repository

```bash
# Choose a directory, e.g. /var/www
mkdir -p /var/www && cd /var/www
git clone https://github.com/your-repo/mailsender.git
cd mailsender
```

## 7. Install project dependencies

```bash
# Backend
npm install   # runs in the root folder (contains server code)
# Frontend (if separate)
cd frontend && npm install && npm run build && cd ..
```

## 8. Configure environment variables

Create a **.env** file in the project root (copy from the existing one) and update:

```dotenv
PUBLIC_API_URL=http://<YOUR_VPS_IP>:5000   # no ngrok needed
# keep other variables (DB credentials, SMTP, etc.) as appropriate
```

## 9. Set up the backend with PM2

```bash
# From the project root
pm2 start src/index.js --name mailsender-backend
pm2 save
pm2 startup   # follow the printed command to enable on boot
```

## 10. Serve the frontend with Nginx

```bash
apt install -y nginx
```

Create a site configuration:

```bash
cat > /etc/nginx/sites-available/mailsender <<'EOF'
server {
    listen 80;
    server_name <YOUR_VPS_IP>;

    root /var/www/mailsender/frontend/build;   # path to built React files
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the Node backend
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

Enable the site and restart Nginx:

```bash
ln -s /etc/nginx/sites-available/mailsender /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

## 11. Verify the deployment

- Open a browser and navigate to `http://<YOUR_VPS_IP>` – you should see the MailSender UI.
- Use the **Server Setup** page to configure remote sending‑IP servers; the UI will now talk directly to the VPS (no ngrok).
- Check the backend logs:

```bash
pm2 logs mailsender-backend
```

## 12. (Optional) Enable HTTPS

- Install Certbot:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

- Follow the prompts to obtain a free Let’s Encrypt certificate.

---

**That’s it!** Your MailSender application is now running 24/7 on a Contabo VPS, with a static public IP, PM2‑managed Node backend, and Nginx‑served React frontend.
