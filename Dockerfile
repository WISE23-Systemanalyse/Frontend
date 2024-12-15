# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json from Frontend/src/
COPY /src/package*.json ./

# Install dependencies
RUN npm install

# Copy the entire Next.js app into the container
COPY src ./

# Build the Next.js app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
