# Backend Architecture Overview

This document provides a clean, well-structured overview of the backend architecture including folder responsibilities, routing flow, utilities, naming conventions, and design principles.

---

## 📁 Folder Responsibilities

### **auth/**

Handles all OAuth logic (e.g., Google OAuth using Passport.js). Contains only provider strategy configuration.

### **middleware/**

Contains reusable middleware such as JWT authentication (`protect`) and request validation.

### **models/**

Defines all MongoDB/Mongoose schemas:

* **User** → Authentication data
* **Habit** → Habit details + schedule
* **HabitLog** → Stores completed logs

### **routes/**

Organized by feature groups:

* **auth/** → Local login, signup, Google OAuth
* **habits.js** → CRUD operations for habits
* **habitLog.js** → Daily/weekly log fetching, toggle completion
* **tokenRoutes.js** → HttpOnly cookie token management

### **controllers/**

Separates business logic from route definitions.
Used for scalable, enterprise structure.

### **services/**

Handles database and business operations independent of controllers.

### **utils/**

Small reusable utilities:

* **date.js** → UTC conversion, week calculations, habit validation
* **generateToken.js** → JWT creation helper

### **db.js**

Establishes MongoDB connection using Mongoose.

---

## 🔀 Routing Overview

### **Authentication Routes**

* Local signup/login
* OAuth login via Google
* JWT handling through secure HttpOnly cookies
* `/auth/me` returns authenticated user profile

### **Habit Routes**

* Create new habits
* Update habit metadata (name, palette, order, etc.)
* Delete habits and associated logs
* Fetch all habits sorted by `order`

### **Habit Log Routes**

* Get computed logs for a **specific UTC date**
* Get logs in a **date range**
* Toggle habit completion for current week only
* Past weeks become locked/read-only
* Only completed logs are persisted

---

## 🕒 Date Handling Strategy

All dates are processed in **UTC** to avoid timezone bugs.

**Rules:**

* Frontend sends UTC timestamps
* Backend normalizes all dates to **UTC midnight**
* Week starts on **Sunday** (`weekStartsOn: 0`)
* Comparison checks use `date-fns` helpers (`isSameWeek`, `isAfter`, `isBefore`)

This ensures:

* No user sees different results due to timezone shifts
* Week logic stays consistent globally

---

## 📊 Logging Strategy

### **Only store what matters.**

To reduce DB size and improve performance:

* **Only completed logs** are stored permanently
* Pending/inactive logs are computed on the fly
* Logs older than the current week cannot be modified
* Habit created date and user account date determine valid range

### States per day:

* **Completed** → stored in DB
* **Active + Pending** → computed on the fly
* **Inactive** → computed via `weekFrequency` or creation date

---

## 🔐 Token Strategy

The backend uses JWT + secure cookies:

* JWT stored in **HttpOnly cookie** (`authToken`)
* `secure: true` in production
* `SameSite: none` for cross-origin (OAuth + frontend)
* Cookie lifespan matches JWT expiration

---

## 🚀 Future Expansion

The architecture is designed to scale easily. Optional additions:

### **Analytics System**

* Weekly, Monthly, Yearly charts
* Completion percentage and habit trends
* Comparative progress (vs previous week)

### **Controllers & Services**

* Move business logic into services for more enterprise structure

### **CRON Jobs**

* Habit streak cleanups
* Historical archiving if logs grow large

### **Pagination**

Not required now because log storage is minimal, but can be added for huge datasets.

---

## 📝 Notes

This architecture focuses on:

* Predictable UTC-safe behavior
* Clean separation of concerns
* Minimum DB writes for maximum performance
* A frontend-friendly API structure
* A strong authentication boundary

If you want, I can also generate:

* API Documentation (Swagger-style)
* A full `README.md` for GitHub
* A diagram of the architecture
