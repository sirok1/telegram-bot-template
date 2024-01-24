FROM node:latest
LABEL authors="sirok1"
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build
ENTRYPOINT ["npm", "start"]