FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install --only=prod --legacy-peer-deps
#--only=prod wont install dev dependendencies(i.e jest) in image
COPY . .

CMD ["npm", "start"]