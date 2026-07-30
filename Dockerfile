# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm v9
RUN npm install -g pnpm@9 --no-audit --no-fund

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev) for building
RUN pnpm install --shamefully-hoist --ignore-scripts 2>&1

# Copy application code
COPY . .

# Build the application
RUN pnpm run build 2>&1

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Install pnpm v9
RUN npm install -g pnpm@9 --no-audit --no-fund

# Copy package files from builder
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --shamefully-hoist --ignore-scripts 2>&1

# Copy built application and scripts from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/lib ./lib

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app/.next

USER nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',(r)=>{r.resume();r.on('end',()=>{process.exit(r.statusCode>=400?1:0)})}).on('error',()=>process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["pnpm", "start"]
