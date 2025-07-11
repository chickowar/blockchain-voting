FROM node:24
WORKDIR /app
COPY . .
RUN npm install

RUN export $(cat .env | xargs)
EXPOSE 1212

CMD ["npm", "run", "dev", "--", "--host"]