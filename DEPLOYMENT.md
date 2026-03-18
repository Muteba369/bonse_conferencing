# Deployment Guide - Bonse Conferencing

Quick step-by-step guide to deploy the web app to production.

---

## Option 1: Vercel (Recommended)

**Time:** 2 minutes
**Cost:** Free tier available
**URL:** `https://your-site.vercel.app`

### Steps:

1. **Create GitHub Repository**
   ```bash
   cd bonse_conferencing
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/bonse-conferencing.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your GitHub repo
   - Click "Import"

3. **Configure Project** (Optional)
   - Framework: "Other" (it's static HTML)
   - Build Command: (leave empty)
   - Output Directory: `.`
   - Root Directory: `.`

4. **Deploy**
   - Click "Deploy"
   - Wait ~30 seconds
   - Get your live URL

5. **Test**
   ```
   https://your-project-name.vercel.app/
   ```

---

## Option 2: Netlify (Also Great)

**Time:** 2 minutes
**Cost:** Free tier available
**URL:** `https://your-site.netlify.app`

### Steps:

1. **Create GitHub Repository** (same as above)

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Connect to Git"
   - Select GitHub
   - Choose your repository
   - Click "Deploy"

3. **Netlify will auto-detect settings**
   - The `netlify.toml` file handles everything
   - No manual configuration needed

4. **Deploy**
   - Automatic deployment happens
   - Get your live URL immediately

5. **Test**
   ```
   https://your-site-name.netlify.app/
   ```

---

## Option 3: Manual Deployment (Self-Hosted)

**Time:** 10 minutes
**Cost:** Your hosting costs
**URL:** `https://yourdomain.com`

### Using Nginx:

```bash
# SSH into your server
ssh user@your-server.com

# Create directory
sudo mkdir -p /var/www/bonse-conferencing

# Copy files
scp -r ./bonse_conferencing/* user@your-server.com:/var/www/bonse-conferencing/

# Create nginx config
sudo nano /etc/nginx/sites-available/bonse-conferencing
```

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/bonse-conferencing;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/html text/plain text/css text/javascript;

    # Cache assets
    location ~* \.(html|js)$ {
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Consultation page
    location /consultation {
        rewrite ^/consultation(.*)$ /consultation.html last;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

**Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/bonse-conferencing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Environment Variables (All Platforms)

**No environment variables needed!** This is a pure client-side app.

All configuration comes from the URL parameters passed by your Flutter app.

---

## Post-Deployment

### 1. Update Flutter App

In your Flutter code, set the web domain:

```dart
const String VIDEO_WEB_DOMAIN = 'https://your-domain.vercel.app';
// or
const String VIDEO_WEB_DOMAIN = 'https://your-domain.netlify.app';
// or
const String VIDEO_WEB_DOMAIN = 'https://yourdomain.com';
```

### 2. Update Django Settings

If using custom domain, update allowed URLs in backend.

### 3. Test End-to-End

1. Open Flutter app
2. Start a consultation
3. Should redirect to your web domain
4. Video should load and work

### 4. Monitor

- Check browser console for errors (F12)
- Monitor Jitsi status: https://status.jitsi.org
- Log analytics events from Jitsi

---

## Custom Domain Setup

### For Vercel:

1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS records at your registrar:
   - `CNAME` record pointing to Vercel nameservers

### For Netlify:

1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records at your registrar

### For Self-Hosted:

Use Let's Encrypt for free SSL:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
sudo certbot renew --dry-run
```

---

## Monitoring & Maintenance

### Health Check

```bash
curl -I https://your-domain.com/consultation
# Should return 200 OK
```

### SSL Certificate

Vercel & Netlify: Auto-renewed automatically ✅

Self-hosted: Renew monthly with Let's Encrypt
```bash
sudo certbot renew
```

### Performance

Monitor at:
- Vercel Analytics: https://vercel.com/dashboard
- Netlify Analytics: https://app.netlify.com

---

## Troubleshooting Deployment

### Page Shows 404

**Cause:** Files not uploaded correctly

**Fix:**
- Vercel: Check in Deployments tab, re-deploy
- Netlify: Check in Deploys tab, redeploy
- Self: Verify files in `/var/www/bonse-conferencing/`

### HTTPS Not Working

**Cause:** SSL certificate not configured

**Fix:**
- Vercel/Netlify: Auto-configured, just wait
- Self-hosted: Use Let's Encrypt (see above)

### JavaScript Files Not Loading

**Cause:** MIME type issue on server

**Fix (Nginx):**
```nginx
types {
    text/html html;
    text/javascript js;
    application/javascript js;
    text/css css;
}

charset utf-8;
default_type text/html;
```

### Consultation Page Blank

**Cause:** Jitsi API not loading

**Fix:**
- Check browser console (F12)
- Add `?DEBUG=true` to URL to enable debug logs
- Ensure meet.jit.si not blocked by firewall

---

## Rollback

### Vercel:
- Go to Deployments
- Click previous deployment
- Click "Redeploy"

### Netlify:
- Go to Deploys
- Click previous deployment
- Click "Publish Deploy"

### Self-hosted:
```bash
# Keep backup of previous version
cp -r /var/www/bonse-conferencing /var/www/bonse-conferencing.backup
# Restore if needed
cp -r /var/www/bonse-conferencing.backup/* /var/www/bonse-conferencing/
```

---

## Performance Optimization

### Caching Headers (Netlify)

Add to `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

### Compression

Both Vercel and Netlify auto-enable gzip ✅

---

## Security Headers

Self-hosted (Nginx):
```nginx
add_header Strict-Transport-Security "max-age=31536000" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
```

---

## DNS Configuration

### For Vercel:

```
CNAME: www.yourdomain.com → cname.vercel-dns.com
A:    yourdomain.com → 76.76.19.0  (or Vercel IP)
```

### For Netlify:

```
CNAME: www.yourdomain.com → your-site.netlify.app
A:    yourdomain.com → varies (check Netlify settings)
```

### For Self-Hosted:

```
A:    yourdomain.com → your-server-ip-address
AAAA: yourdomain.com → your-ipv6-address (optional)
```

---

## Summary Table

| Platform | Setup Time | Cost | Auto SSL | Custom Domain | Reliability |
|----------|-----------|------|---------|---------------|-------------|
| Vercel | 2 min | Free (free tier) | ✅ Yes | ✅ Easy | ⭐⭐⭐⭐⭐ |
| Netlify | 2 min | Free (free tier) | ✅ Yes | ✅ Easy | ⭐⭐⭐⭐⭐ |
| Self-hosted | 15 min | $$$ | ✅ Let's Encrypt | ✅ Manual | ⭐⭐⭐ |

---

**Recommendation:** Start with Vercel (simplest, fastest, most reliable)

**Updated:** 2026-03-17
