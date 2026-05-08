# Use Node.js image
FROM node:18

# create app directory
WORKDIR /app

# copy packages files
COPY package*.json ./

# install dependancies
RUN npm install

# copy rest of files
COPY . .

# expose port
EXPOSE 5000

# start app
CMD ["node","src/app.js"]