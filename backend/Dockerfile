# Use official Node.js image
FROM node:18

# Create and set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json /app
RUN npm install --verbose

# Copy the rest of the backend code
COPY . /app

# Expose the port
EXPOSE 3000

# Start the backend server
CMD ["npm", "start"]
