# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build
COPY . .
# We can provide a dummy VITE_API_BASE_URL to avoid build errors if needed, 
# though Vite handles runtime envs if properly configured. 
# It's better to pass it as an argument during build if required.
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template
# The nginx:alpine image will automatically substitute ${PORT} using envsubst
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default fallback port if PORT is not set
ENV PORT=80
EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]
