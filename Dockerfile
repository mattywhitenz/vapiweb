FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Set the port for the application
ENV PORT=8998

# Expose the port the app runs on
EXPOSE 8998

# Command to run the application
CMD ["node", "server.js"] 