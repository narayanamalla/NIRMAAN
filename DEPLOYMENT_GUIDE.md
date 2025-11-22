# Deployment Guide - Communication Skills Analysis Tool

This guide provides step-by-step instructions for deploying the Communication Skills Analysis Tool to various platforms.

## Prerequisites

- Node.js 18+ installed
- Git repository with the project code
- Basic knowledge of command line operations

## Method 1: Local Development Server

### Steps

1. **Clone the Repository**
   ```bash
   git clone <your-repository-url>
   cd NIRMAAN
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open your browser and go to `http://localhost:3000`
   - The application will be running locally

### Notes

- This is for development and testing only
- The server will auto-reload when you make changes
- Initial NLP model loading may take a few seconds

## Method 2: Static Site Deployment (Recommended)

Since the application can run entirely in the browser, we can deploy it as a static site.

### Build for Production

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Test Production Build Locally**
   ```bash
   npm start
   ```

3. **Deploy Static Files**
   - The build output is in the `.next` directory
   - Copy the contents to your web server or static hosting platform

### Platforms

#### Vercel (Easiest)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Follow the prompts** to complete deployment

#### Netlify

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Create an account or login
   - Drag and drop the `.next` folder
   - Or connect your Git repository for automatic deployments

#### GitHub Pages

1. **Build and Export Static Files**
   ```bash
   npm run build
   npx next export
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add built application"
   git push origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository settings
   - Enable GitHub Pages from the main branch
   - Select the `out` folder as the source

#### Custom Server

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Serve Static Files**
   - Using Nginx:
     ```nginx
     server {
         listen 80;
         server_name your-domain.com;
         root /path/to/.next;
         index index.html;

         location / {
             try_files $uri $uri/ /index.html;
         }
     }
     ```

   - Using Apache:
     ```apache
     <VirtualHost *:80>
         ServerName your-domain.com
         DocumentRoot /path/to/.next
         DirectoryIndex index.html
     </VirtualHost>
     ```

## Method 3: AWS Free Tier Deployment

### Option A: AWS S3 + CloudFront

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   - Go to AWS S3 console
   - Create a new bucket
   - Enable static website hosting
   - Upload the contents of `.next` folder

3. **Configure CloudFront** (Optional but recommended)
   - Create CloudFront distribution
   - Point to your S3 bucket
   - Enable HTTPS

### Option B: AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu (free tier eligible)
   - Configure security group to allow HTTP (port 80) and HTTPS (port 443)

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clone and Deploy**
   ```bash
   git clone <your-repository-url>
   cd NIRMAAN
   npm install
   npm run build
   npm start
   ```

5. **Install PM2 for Process Management**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "app" -- start
   pm2 startup
   pm2 save
   ```

## Method 4: Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Build and Run

1. **Build Docker Image**
   ```bash
   docker build -t communication-skills-tool .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 communication-skills-tool
   ```

3. **Deploy to Docker Hub or Private Registry**
   ```bash
   docker tag communication-skills-tool username/repo-name
   docker push username/repo-name
   ```

## Environment Configuration

### Production Environment Variables

The application doesn't require any environment variables, but you can optionally add:

```bash
NEXT_PUBLIC_APP_NAME="Communication Skills Analysis Tool"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Security Considerations

1. **HTTPS** - Always use HTTPS in production
2. **Content Security Policy** - Configure CSP headers if needed
3. **Rate Limiting** - Consider rate limiting for the API endpoint if deployed to a server
4. **Monitoring** - Set up monitoring for production deployments

## Testing Your Deployment

After deployment, test the following:

1. **Basic Functionality**
   - Homepage loads correctly
   - Can input transcript text
   - Scoring button works
   - Results display properly

2. **NLP Functionality**
   - Test with different transcripts
   - Verify scoring works
   - Check semantic similarity calculations

3. **Performance**
   - Initial load time (NLP model download)
   - Subsequent scoring speed
   - Mobile responsiveness

4. **Edge Cases**
   - Empty transcript
   - Very long transcripts
   - Special characters in text

## Troubleshooting

### Common Issues

1. **NLP Model Loading Issues**
   - Ensure browser supports WebAssembly
   - Check network connectivity for model download
   - Consider pre-loading models on first visit

2. **Build Errors**
   - Ensure all dependencies are installed
   - Check Node.js version compatibility
   - Verify rubric.json format is correct

3. **Deployment Issues**
   - Check server logs
   - Verify file permissions
   - Ensure static files are served correctly

### Getting Help

- Check the GitHub repository for issues
- Review the test scenarios in `test-scenarios.js`
- Verify rubric configuration in `rubric.json`
- Check browser console for JavaScript errors

## Maintenance

### Updates

1. **Update Dependencies**
   ```bash
   npm update
   npm audit fix
   ```

2. **Rebuild and Redeploy**
   ```bash
   npm run build
   # Deploy updated files
   ```

3. **Monitor Performance**
   - Check scoring accuracy periodically
   - Monitor for model loading issues
   - Review user feedback

### Scaling

For higher traffic deployments:
- Consider CDN for static assets
- Implement caching for NLP models
- Add load balancing if running multiple instances
- Monitor and optimize database queries (if added)

This guide should help you successfully deploy the Communication Skills Analysis Tool to your preferred platform.