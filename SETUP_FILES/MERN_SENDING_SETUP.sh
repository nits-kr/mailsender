#!/bin/bash
# MERN Sending Agent Setup Script
# Run as: sudo bash MERN_SENDING_SETUP.sh

echo "[1/4] Updating System..."
sudo apt update && sudo apt upgrade -y

echo "[2/4] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "[3/4] Installing PM2 and dependencies..."
sudo npm install -g pm2

echo "[4/4] Downloading and Installing Mailer Agent..."
mkdir -p /opt/mailer-agent
cd /opt/mailer-agent
# Replace with your Main Server IP
MAIN_SERVER_IP="173.249.50.153"
wget http://$MAIN_SERVER_IP/all_tar/node_mailer_agent.tar.gz
tar -xzvf node_mailer_agent.tar.gz --strip-components=1
rm node_mailer_agent.tar.gz

# Use local npm install
npm install

echo "Setup Complete! Starting Agent..."
pm2 start mailerAgent.js --name mailer-agent
pm2 save
pm2 startup

echo "===================================================="
echo " MERN Sending Agent is now running via PM2"
echo " Central API: http://$MAIN_SERVER_IP:5000/api/legacy"
echo "===================================================="
