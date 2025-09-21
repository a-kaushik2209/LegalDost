# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy backend source code (exclude client)
COPY server.js ./
COPY routes/ ./routes/
COPY models/ ./models/
COPY services/ ./services/
COPY uploads/ ./uploads/

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]