FROM node:9.4.0
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
CMD ["npm", "start"]
