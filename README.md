# 🏆 Sports Management System

A modern, full-stack sports management platform for **colleges**, **clubs**, or **academies**.  
It includes user authentication, role-based dashboards, player/team/tournament/match management, notifications, and robust security.

---

## 🖥️ Tech Stack

### 🔹 Frontend
- **React 19** + **Vite**
- **Zustand** (global state management)
- **React Query** (API/server data synchronization)
- **Material UI (MUI)** (UI components)
- **Formik** + **Yup** (form handling and validation)
- `axios`, `jwt-decode`

### 🔹 Backend
- **Node.js** + **Express**
- **MySQL (InnoDB)** (database)
- `express-validator` (request validation)
- `bcryptjs` (password hashing)
- `helmet`, `jsonwebtoken` (security)

---

## 🚀 Features

- 🚪 **Role-based Authentication**: Separate portals for Players, Coaches, and Admins
- 🔑 **Secure JWT Authentication**: Token-based access control
- 🏃‍♂️ **CRUD Operations**: Manage Players, Teams, Coaches, Tournaments, Venues, and Matches
- 🏆 **Tournament & Team Management**: Registration, match scheduling
- ⚡ **Batch Actions**: Assign coaches, soft/hard delete multiple records
- 📴 **Soft Delete**: Supported via status enum
- 🧹 **Multi-layer Validation**: Frontend forms (Yup), backend (express-validator), and database triggers
- 🎨 **Responsive UI**: Dialogs, tables, and dashboard cards
- 📣 **Notifications**: In-app notifications, profile & skills management
- 🛑 **Race-condition Free Scheduling**: Ensured via database triggers

---

## 🛠️ Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/skote05/Sports-Managment-System-Deploy.git
cd sports-management-system-deploy
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example` with your database credentials:
```text
DB_HOST=localhost
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_pass
DB_NAME=sports_management
JWT_SECRET=your_jwt_secret
```

Run the seed script to add a default admin user(Have to do this to access admin features):
```bash
npm run seed
# or
node seedAdmin.js
```

Start the backend server:
```bash
npm run dev
# or
npm start
```

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
npm install
```

Create a `.env` file (or `.env.local`):
```text
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

Access the application at: [http://localhost:5173](http://localhost:5173)

---

## 🚌 Project Directory Structure

```
sports-management-system/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seedAdmin.js
│   ├── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   ├── public/
├── .env.example
```

---

## 👑 Default Admin Credentials

- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## 🛡️ Security and Validation

- **Password Hashing**: BCrypt with 12 rounds for all passwords
- **JWT Authentication**: Verified on every backend request
- **Role-based Access**: Enforced on both frontend and backend
- **HTTPS**: Enforced in production
- **Validation**: Multi-layer validation with Yup (frontend), express-validator (backend), and database constraints/triggers

---

## 📝 Contributing

1. Fork this repository and clone it locally.
2. Create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add my feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/my-feature
   ```
5. Open a Pull Request on GitHub.

---

## 📚 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤔 FAQ

### How can I reset the admin password?
Update the password directly in the database by hashing a new password with BCrypt (12 rounds). Alternatively, implement admin password-reset logic.

### How do I add new sports, roles, or features?
- Update the canonical lists in `frontend/src/constants.js`.
- Add new API endpoints and backend logic as needed.

### How is data integrity ensured?
All user input is validated on the frontend, re-validated on the backend, and enforced with SQL triggers in the database for business rules.

---

## 🗂️ Credits

Built by **Shashank Kote**.  
For questions, issues, or contributions, open an Issue or Pull Request on [GitHub](https://github.com/your-username/sports-management-system).

---

✨ **This README is optimized for recruiters, developers, and rapid onboarding!** ✨