# Railway Deployment Guide - Frontend

This guide explains how to deploy the Angular frontend to Railway.

## Prerequisites

- Railway account
- Backend deployed and running on Railway
- Backend URL available

## Deployment Steps

### 1. Create a New Railway Project

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo" or "Empty Project"

### 2. Configure Environment Variables

In your Railway project settings, add the following environment variable:

```
API_URL=https://your-backend-url.up.railway.app
```

**Important**: Replace `your-backend-url.up.railway.app` with your actual backend Railway URL.

### 3. Deploy

Railway will automatically:
- Detect the `Dockerfile`
- Build the Docker image
- Run the container
- Expose it on a public URL

### 4. Update Backend CORS

Once your frontend is deployed, you need to update the backend's `FRONTEND_URL` environment variable:

```
FRONTEND_URL=https://your-frontend-url.up.railway.app
```

This ensures the backend accepts requests from your frontend.

## How It Works

### Build Process

1. **Stage 1 (Build)**:
   - Uses Node.js 18 Alpine image
   - Installs dependencies with `npm ci`
   - Builds the Angular app for production
   - Output goes to `dist/modernize`

2. **Stage 2 (Serve)**:
   - Uses Nginx Alpine image
   - Copies built files from Stage 1
   - Runs `env.sh` script at startup to inject `API_URL`
   - Serves the app on port 80

### Environment Variable Injection

The `env.sh` script runs at container startup and replaces the placeholder `PLACEHOLDER_API_URL` in the built JavaScript files with the actual `API_URL` environment variable.

This allows you to change the backend URL without rebuilding the Docker image.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `API_URL` | Backend API URL | `https://your-backend.up.railway.app` |

## Health Check

The application includes a health check endpoint at `/health` that returns "OK".

Railway will use this to monitor the application's health.

## Files Created for Deployment

- `Dockerfile` - Multi-stage Docker build configuration
- `nginx.conf` - Nginx web server configuration
- `env.sh` - Runtime environment variable injection script
- `railway.json` - Railway-specific configuration
- `.dockerignore` - Files to exclude from Docker build
- `src/environments/environment.ts` - Development environment config
- `src/environments/environment.prod.ts` - Production environment config

## Troubleshooting

### API calls failing

1. Check that `API_URL` is set correctly in Railway
2. Verify the backend is running and accessible
3. Check browser console for CORS errors
4. Ensure backend's `FRONTEND_URL` matches your frontend URL

### Build failing

1. Check Railway build logs
2. Ensure all dependencies are in `package.json`
3. Verify Node version compatibility (using Node 18)

### Application not loading

1. Check Railway deployment logs
2. Verify Nginx is running
3. Check the health endpoint: `https://your-app.up.railway.app/health`

## Local Testing with Docker

To test the Docker build locally:

```bash
# Build the image
docker build -t frontend-app .

# Run the container
docker run -p 8080:80 -e API_URL=http://localhost:8080 frontend-app

# Access at http://localhost:8080
```

## Notes

- The app uses a multi-stage build to keep the final image small
- Only production dependencies are included in the final image
- Nginx serves static files with caching headers for better performance
- The build process uses Angular's production configuration
