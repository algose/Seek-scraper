FROM node:18-slim

# Install Chromium dependencies (full compatibility mode)
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libxss1 \
  xdg-utils \
  libglib2.0-0 \
  libu2f-udev \
  libdrm2 \
  libxext6 \
  libexpat1 \
  libpci3 \
  libxfixes3 \
  libjpeg62-turbo \
  libpng16-16 \
  lsb-release \
  wget \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Launch script
CMD ["node", "index.js"]
