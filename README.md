# PreQursor Backend

Backend API for **PreQursor**, an esports platform where players can join competitive matches and tournaments.

This repository contains the REST API responsible for handling match management, wallet operations, user authentication, and admin operations for the PreQursor platform.

---

## Features

- User authentication
- Match creation and management
- Match booking system
- Wallet management
- Prize pool handling
- Screenshot submission for match verification
- Admin operations for managing matches and users
- REST API architecture

---

## Tech Stack

- NestJS
- Node.js
- TypeScript
- MongoDB
- Mongoose

---

## Setup

Clone the repository:

```bash
git clone https://github.com/Abdul-Wasay-008/PreQursor-BE.git
cd PreQursor-BE
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run start:dev
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
UPLOAD_PATH=uploads
```

---

## Frontend

The frontend for this project is available in the **PreQursor-FE** repository.

---

## License

MIT License
