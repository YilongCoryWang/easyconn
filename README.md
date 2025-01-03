# EasyConn

## Purpose

This project realizes the function of voice and video communication for users

## Tech used

Frontend: React + Typescript, webRTC
Backend: Express + Typescript, SocketIO
DB: mongoose + mongodb docker

## How to run locally

### Frontend

```
cd frontend
npm install
npm run dev
```

### Backend

1. Start MongoDB docker

```
docker run --name mongodb -d -p 27017:27017 -v ${pwd}/mongodb:/data/db -e MONGO_INITDB_ROOT_USERNAME=user -e MONGO_INITDB_ROOT_PASSWORD=pass mongodb:latest
```

2. Import seed data to db

```
cd backend
npm install
npm run seed
```

3. Start app server

```
npm start
```

## Todo

Improve db operations
Improve hangup button
