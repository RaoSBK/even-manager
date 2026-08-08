# GK Event Management System

A premium, role-based event management system dashboard interface built to organize and book marriage receptions, birthday parties, saree ceremonies, and banquets (dawaths).

---

## 🛠️ Technology Stack

- **Frontend Core:** React 18, TypeScript, Vite
- **Routing:** React Router v7 (with Protected and Role-based guards)
- **Styling:** TailwindCSS, Vanilla CSS, Google Fonts
- **Iconography:** Lucide Icons
- **State Management & Auth:** Context API, Custom Hooks, Persistent Session Stores

---

## 🚀 Local Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Installation
Navigate into the `client` directory and install the packages:
```bash
cd client
npm install
```

### 2. Running in Development Mode
Start the Vite dev server locally:
```bash
npm run dev
```
The application will start on [http://localhost:3000/](http://localhost:3000/).

### 3. Production Build
To build the application for client delivery or Netlify deployment:
```bash
npm run build
```

### 4. Local Preview
To test the production build locally before uploading:
```bash
npm run preview
```

---

## ☁️ Netlify Deployment

The repository is fully configured for continuous integration/deployment on **Netlify**.

### Build Settings
When connecting this repository to Netlify, configure the following settings:
- **Base directory:** `client`
- **Build command:** `npm run build`
- **Publish directory:** `dist`

All parameters are specified automatically in the root [netlify.toml](netlify.toml) file. A [_redirects](client/public/_redirects) file is placed in `client/public/` to prevent Netlify 404 router errors when reloading internal pages.

---

## 🔑 Demo Access Accounts

The frontend preview deployment uses mock authentication. Use the following credentials to access the different workspaces:

### 1. Admin Workspace (Administrator Panel)
- **Email:** `admin@gkevent.com`
- **Password:** `Admin@123`
- **Dashboard Path:** `/admin/dashboard`

### 2. Employee Workspace (Staff Workstation)
- **Email:** `employee@gkevent.com`
- **Password:** `Employee@123`
- **Dashboard Path:** `/employee/dashboard`

### 3. User Workspace (Customer Hub)
- **Email:** `user@gkevent.com`
- **Password:** `User@123`
- **Dashboard Path:** `/user/dashboard`
