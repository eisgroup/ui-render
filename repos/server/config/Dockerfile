FROM node:10.15.3
# node:9 has YARN_VERSION 1.5.1

# Install pm2 to manage Node process
RUN yarn global add pm2

WORKDIR /home/node/app

# Install App (needed for modules that cannot be compiled, like `sharp` for graphics processing)
COPY package.json ./
RUN yarn install --production

# Add Code
COPY index.js ./

# Set the user to use when running this image
CMD ["pm2", "start", "index.js", "--no-daemon"]
