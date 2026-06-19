This folder contains an example Nginx server block to route path-based apps for `evaltools.u-next.com`.

Overview
- Homepage: https://evaltools.u-next.com/ (serves `Home page.html`)
- EvalAI UI: https://evaltools.u-next.com/evalai/ -> localhost:3001
- ComCoachAI UI: https://evaltools.u-next.com/comcoachai/ -> localhost:3002
- ComCoachAI API: https://evaltools.u-next.com/api/comcoachai/ -> localhost:8000/api/
- ConvAI UI: https://evaltools.u-next.com/convai/ -> localhost:3003
- ConvAI API: https://evaltools.u-next.com/api/convai/ -> localhost:8003/api/

Quick deploy (Linux)
1. Copy the file to Nginx sites-available and enable it:

```bash
sudo cp deploy/nginx-evaltools.conf /etc/nginx/sites-available/evaltools
sudo ln -s /etc/nginx/sites-available/evaltools /etc/nginx/sites-enabled/
```

2. Build and place the dashboard static files at `/var/www/evaltools`:

```bash
npm ci
npm run build
sudo mkdir -p /var/www/evaltools
sudo cp -r dist/* /var/www/evaltools/
sudo chown -R www-data:www-data /var/www/evaltools
```

3. Test and reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Local testing (dev machine)
- Edit your hosts file to map the domain to the server where nginx runs.
  - Linux/Mac: edit `/etc/hosts` (requires sudo)
  - Windows: edit `C:\Windows\System32\drivers\etc\hosts` (Admin)

Add this line for local dev (adjust IP if testing on remote server):

```
127.0.0.1 evaltools.u-next.com
```

- If you don't have a TLS cert locally, for testing you can comment out the HTTP->HTTPS redirect and use plain HTTP (port 80) while developing.
- For local HTTPS, use `mkcert` to create a local certificate and update the `ssl_certificate` paths in the config.

Notes and tips
- EvalAI reads `Tools/EvalAI/.streamlit/config.toml` and serves from `/evalai/`.
- ComCoachAI's Next.js `basePath` is `/comcoachai`; its API client uses `/api/comcoachai`.
- ConvAI's Vite `base` and Wouter router use `/convai/`; its API client uses `/api/convai`.
- Backend API prefixes are stripped by Nginx, so existing FastAPI route handlers remain unchanged.
- If an app uses WebSockets, the `Upgrade` and `Connection` headers are set in each location.
- Adjust backend ports to match where each AI tool runs.
- When deploying behind a firewall or cloud LB, ensure ports and security groups allow traffic only to nginx and that nginx can reach backend ports.

If you'd like, I can:
- Update one AI app to use a `basename` (React) or `publicPath` (Vue).
- Provide a Docker Compose example that runs nginx + the three apps together.
- Generate a systemd unit or certbot command to obtain Let's Encrypt certs automatically.
