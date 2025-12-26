# Docker Setup Guide

## Building the Docker Image

```bash
docker build -t rest-express:latest .
```

## Running with Docker (Port Mapping Required)

**Important:** You must map port 5000 from the container to your host machine:

```bash
docker run -p 5000:5000 rest-express:latest
```

This command:
- `-p 5000:5000` - Maps container port 5000 to host port 5000 (HOST:CONTAINER)
- Now you can access the app at `http://localhost:5000`

## Running with Docker Compose (Recommended)

```bash
docker-compose up
```

Then access the app at: `http://localhost:5000`

## Troubleshooting

### Ports not accessible
- Ensure you're using the `-p` flag when running the container
- Check if port 5000 is already in use on your machine
- Try a different port: `docker run -p 8000:5000 rest-express:latest`

### Application not starting
- Check logs: `docker logs <container-id>`
- Build with no cache: `docker build --no-cache -t rest-express:latest .`

### MongoDB connection issues
- If using local MongoDB, ensure it's running before starting the container
- For remote MongoDB, set the appropriate connection string
