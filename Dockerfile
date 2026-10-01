# Gunakan base image Node.js Alpine yang ringan
FROM node:20-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Set environment variable
ENV NODE_ENV=production
ENV PORT=3000

# Salin dependency definitions terlebih dahulu untuk caching layer
COPY package*.json ./

# Install dependencies untuk production
RUN npm ci --omit=dev

# Salin seluruh file project
COPY . .

# Pastikan direktori uploads dan public/audio tersedia
RUN mkdir -p uploads public/audio

# Buka port 3000
EXPOSE 3000

# Perintah untuk menjalankan server
CMD ["node", "server.js"]
