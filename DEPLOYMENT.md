# 📚 Deployment Guide - Jamfadly Mart & Kos Rosely

## 🎯 Quick Deploy Links

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Fadhlymuhammad27/Business&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY)

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Fadhlymuhammad27/Business)

## 🚀 Platform-Specific Deployment Instructions

### 1. Vercel Deployment

#### Via Vercel Dashboard:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

#### Via CLI:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts and set env variables
```

### 2. Netlify Deployment

#### Via Netlify Dashboard:
1. Go to [Netlify](https://app.netlify.com)
2. Drag and drop the `dist` folder OR
3. Connect GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Set environment variables in Site Settings > Environment Variables

#### Via CLI:
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --dir=dist --prod
```

### 3. GitHub Pages Deployment

#### Setup:
1. Install gh-pages package:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json scripts:
```json
{
  "scripts": {
    "predeploy": "npm run build:github",
    "deploy:github": "gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run deploy:github
```

4. Configure GitHub Pages:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

**Note**: GitHub Pages URL will be: `https://fadhlymuhammad27.github.io/Business/`

### 4. Cloudflare Pages

#### Via Dashboard:
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Create a project
3. Connect GitHub repository
4. Build configuration:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Set environment variables

#### Via Wrangler CLI:
```bash
# Install Wrangler
npm i -g wrangler

# Build project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=jamfadly-mart
```

## 🔐 Environment Variables

All deployments require these environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key (optional)
```

### Getting Supabase Credentials:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon/Public key → `VITE_SUPABASE_ANON_KEY`

## 🔧 Build Commands

```bash
# Development
npm run dev

# Production build (general)
npm run build

# Production build for GitHub Pages
npm run build:github

# Preview production build locally
npm run preview
```

## 🌐 Custom Domain Setup

### Vercel:
1. Go to Project Settings > Domains
2. Add your domain
3. Follow DNS configuration instructions

### Netlify:
1. Go to Site Settings > Domain Management
2. Add custom domain
3. Configure DNS records

### GitHub Pages:
1. Create `CNAME` file in `dist` folder with your domain
2. Configure DNS:
   - A records: 185.199.108-111.153
   - CNAME: yourusername.github.io

### Cloudflare Pages:
1. Add custom domain in project settings
2. DNS records are automatically configured if using Cloudflare DNS

## 📊 Performance Optimization

The build is already optimized with:
- Code splitting (vendor, supabase, charts, pdf bundles)
- Asset optimization
- Tree shaking
- Minification

### Additional optimizations:
1. Enable Gzip/Brotli compression on your CDN
2. Set proper cache headers (already configured)
3. Use CDN for static assets
4. Enable HTTP/2 or HTTP/3

## 🔍 Monitoring

### Vercel Analytics:
- Automatically included in Vercel deployments
- View in Vercel Dashboard > Analytics

### Netlify Analytics:
- Enable in Site Settings > Analytics
- Requires paid plan

### Google Analytics:
Add to `index.html`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 Troubleshooting

### Build Fails:
- Check Node.js version (requires 18+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Verify environment variables are set

### 404 Errors on Routes:
- Ensure redirect rules are configured
- Check `vercel.json` or `netlify.toml` exists
- For GitHub Pages, use HashRouter (already configured)

### Supabase Connection Issues:
- Verify API keys are correct
- Check Supabase project is active
- Review RLS policies in Supabase

### White Screen:
- Check browser console for errors
- Verify base URL in vite.config.ts
- Clear browser cache
- Check if JavaScript is enabled

## 📝 Post-Deployment Checklist

- [ ] Test all pages and routes
- [ ] Verify Supabase connection
- [ ] Test CRUD operations
- [ ] Check responsive design on mobile
- [ ] Test PDF export functionality
- [ ] Monitor error logs
- [ ] Set up uptime monitoring
- [ ] Configure backup strategy
- [ ] Document API endpoints
- [ ] Set up CI/CD pipeline

## 🆘 Support

For deployment issues:
1. Check the [Issues](https://github.com/Fadhlymuhammad27/Business/issues) page
2. Review deployment platform documentation
3. Contact platform support (Vercel, Netlify, etc.)

## 📚 Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/docs/en/v6/deploying)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Production](https://tailwindcss.com/docs/optimizing-for-production)