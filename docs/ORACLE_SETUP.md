# Hosting the FitPlate server on Oracle Cloud Always Free

Steps marked **You** are done by hand in your browser or terminal. The server code is already in the repo.

## 1. You: make the VM
1. Sign up at cloud.oracle.com (card needed for identity checks). Choose the **Mumbai** home region.
2. Compute > Instances > Create. Image: **Ubuntu 22.04**. Shape: **VM.Standard.A1.Flex** (1 OCPU, 6 GB) or **VM.Standard.E2.1.Micro**, whichever says "Always Free eligible". "Out of capacity" means try again later or the other shape.
3. Download the SSH key it offers. Note the public IP.
4. Networking: on the instance's subnet, open the Security List and add ingress rules for TCP **80** and **443** from `0.0.0.0/0`.

## 2. You: a free web address with HTTPS
iPhones refuse plain `http://` servers, so the server needs HTTPS.
1. Make a free name at duckdns.org (for example `fitplate-yourname.duckdns.org`) and point it at the VM's public IP.

## 3. You: set up the VM (SSH in: `ssh -i key ubuntu@IP`)
```
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo apt-get update && sudo apt-get install -y git curl caddy
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs
git clone https://github.com/Sudarsannn/FITPLATE.git && cd FITPLATE
git checkout claude/project-thread-wchnlm && npm ci
sudo mkdir -p /data && sudo chown ubuntu /data
```
(If the repo is private, clone with a GitHub token.)

Make a long secret: `openssl rand -hex 32`. Save it, it is your access key.

Create `/etc/fitplate.env`:
```
HOST=127.0.0.1
FITPLATE_SERVER_PORT=8787
FITPLATE_ACCESS_KEY=<the secret>
FITPLATE_TOKEN_FILE=/data/swiggy
FITPLATE_ALLOWED_ORIGINS=https://fitplate.sudarsanmohanchander.workers.dev
```
Here the server listens only on the VM itself and Caddy puts HTTPS in front, so the access-key check still applies through `FITPLATE_ACCESS_KEY` even though `HOST` is local. (To force the check on, also set `HOST=0.0.0.0` and close port 8787 in the firewall.)

Caddy: put this in `/etc/caddy/Caddyfile`, then `sudo systemctl restart caddy`:
```
fitplate-yourname.duckdns.org {
  reverse_proxy 127.0.0.1:8787
}
```
Service: create `/etc/systemd/system/fitplate.service`:
```
[Unit]
Description=FitPlate server
After=network.target
[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/FITPLATE
EnvironmentFile=/etc/fitplate.env
ExecStart=/usr/bin/node server/fitplate-server.mjs
Restart=always
[Install]
WantedBy=multi-user.target
```
Then `sudo systemctl enable --now fitplate`.

Check: `curl https://fitplate-yourname.duckdns.org/api/health` returns `{"ok":true,...}`.

## 4. You: point the phone build at it
In the Fitplate folder's `.env` on your Mac (never commit it):
```
EXPO_PUBLIC_FITPLATE_API_URL=https://fitplate-yourname.duckdns.org
EXPO_PUBLIC_FITPLATE_API_KEY=<the secret>
```
Rebuild: `npx expo run:ios --device --configuration Release`. Then Profile > Shopping & vendors > Use real Swiggy > Connect, and paste the return address (see HOSTED_SERVER.md).

## Updating later
`cd FITPLATE && git pull && npm ci && sudo systemctl restart fitplate`. The Swiggy login in `/data` survives restarts.
