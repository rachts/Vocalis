# Vocalis Deployment Guide

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] Run `npm run type-check` (must pass with 0 errors)
- [ ] Run `npm run lint` (must pass)
- [ ] Run `npm run build` (must build successfully)
- [ ] Test all voice commands locally
- [ ] Test all UI interactions
- [ ] Verify todo persistence works
- [ ] Test search functionality
- [ ] Check weather API connection

### 2. Environment Variables
- [ ] Create `.env.production` file
- [ ] Set `NEXT_PUBLIC_API_URL` for production
- [ ] Set `PORT` if needed (default 3001)

### 3. Browser Testing
- [ ] Test in Chrome (speech recognition)
- [ ] Test in Edge (speech recognition)
- [ ] Test in Safari (speech recognition)
- [ ] Test in Firefox (UI only, no speech)
- [ ] Test mobile responsiveness

## Vercel Deployment

### Step 1: Prepare Repository
\`\`\`bash
git add .
git commit -m "Ready for deployment"
git push origin main
\`\`\`

### Step 2: Vercel Setup
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
   - Install Command: `npm install`
   - Development Command: `npm run dev`

### Step 3: Environment Variables
Add these in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`: `https://your-domain.vercel.app`

### Step 4: Deploy
Click "Deploy" and wait for build to complete.

### Step 5: Post-Deployment
1. Test all features on production URL
2. Verify HTTPS is working (required for speech recognition)
3. Test voice commands
4. Check mobile responsiveness
5. Verify todo persistence
6. Test all navigation commands

## Alternative: Manual Server Deployment

### Prerequisites
- Ubuntu 20.04+ server
- Node.js 18+
- Nginx
- SSL certificate

### Step 1: Server Setup
\`\`\`bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/vocalis.git
cd vocalis
npm install
\`\`\`

### Step 2: Build Application
\`\`\`bash
npm run build
\`\`\`

### Step 3: Configure PM2
\`\`\`bash
# Start app
pm2 start npm --name "vocalis" -- start

# Start backend
pm2 start server.js --name "vocalis-api"

# Save PM2 config
pm2 save
pm2 startup
\`\`\`

### Step 4: Nginx Configuration
\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

### Step 5: SSL Certificate
\`\`\`bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
\`\`\`

## Performance Optimization

### 1. Enable Gzip Compression
Add to `next.config.mjs`:
\`\`\`javascript
compress: true
\`\`\`

### 2. Image Optimization
- Use Next.js Image component
- Set proper width/height
- Use WebP format when possible

### 3. Code Splitting
- Already handled by Next.js
- Lazy load heavy components if needed

### 4. Caching
- Set proper cache headers
- Use Vercel Edge caching
- Cache API responses when appropriate

## Monitoring

### Vercel Analytics
1. Enable in Vercel dashboard
2. Monitor performance metrics
3. Track user interactions

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage stats

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run type-check`
- Check ESLint errors: `npm run lint`
- Verify all dependencies are installed
- Check Node.js version (must be 18+)

### Speech Recognition Not Working
- Verify HTTPS is enabled
- Check browser compatibility
- Verify microphone permissions
- Check browser console for errors

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS configuration
- Verify backend server is running
- Check network tab in DevTools

### Todo List Not Persisting
- Check localStorage is enabled
- Verify browser allows localStorage
- Check for localStorage quota exceeded

## Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Manual Server
\`\`\`bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or checkout specific commit
git checkout <commit-hash>
npm install
npm run build
pm2 restart all
\`\`\`

## Security Considerations

1. **API Security**
   - Use environment variables for sensitive data
   - Enable CORS properly
   - Rate limit API endpoints
   - Validate all user inputs

2. **Client Security**
   - Sanitize localStorage data
   - Validate speech recognition inputs
   - Implement CSP headers
   - Regular dependency updates

3. **Server Security**
   - Keep Node.js updated
   - Use HTTPS everywhere
   - Implement proper authentication if needed
   - Regular security audits

## Support

For issues or questions:
- Check the README.md
- Review browser console for errors
- Verify all environment variables are set
- Test locally before deployment

Created by Rachit
