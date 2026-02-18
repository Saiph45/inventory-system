# 📦 ERP Inventory System (Phase 2 Completed)

A full-stack Inventory Management System built with **Next.js, Node.js, Express, and MongoDB**. 
This system allows businesses to track stock, manage orders, and visualize sales data in real-time.

---

## 🚀 Phase 2 Features (Advanced)
✅ **Analytics Dashboard:** Visual charts for stock levels and sales distribution using `Chart.js`.
✅ **Bulk Upload:** Admins can upload a CSV file to add multiple products at once.
✅ **Advanced RBAC:** 3-Role System (Admin, Manager, Staff) with specific permissions.
✅ **Export Reports:** Download sales history as CSV.
✅ **External API:** "Daily Wisdom" widget fetches data from a public API.

---

## 🛠️ Architecture
The application follows a **Client-Server Architecture**:
1.  **Frontend (Client):** Built with Next.js (React) and Tailwind CSS. It handles the UI, charts, and user interactions.
2.  **Backend (Server):** Built with Node.js and Express. It provides RESTful APIs for products, orders, and authentication.
3.  **Database:** MongoDB (Atlas) stores all data (Users, Products, Orders) in a document-based format.

**Flow:** `User Interaction` -> `Next.js Client` -> `API Request (Axios/Fetch)` -> `Express Server` -> `MongoDB`

---

## 🗄️ Database Schema
### 1. User Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Full name of the staff member |
| `email` | String | Unique login email |
| `password` | String | Hashed password (bcrypt) |
| `role` | String | 'admin', 'manager', or 'staff' |

### 2. Product Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Product Name |
| `price` | Number | Unit Price |
| `quantity` | Number | Stock Quantity |
| `sku` | String | Unique Stock Keeping Unit (Auto-generated) |

### 3. Order Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `customerName` | String | Name of buyer |
| `items` | Array | List of products purchased |
| `total` | Number | Total transaction value |
| `date` | Date | Timestamp of sale |

---

## 🚀 Deployment Guide
### Prerequisites
* Node.js installed
* MongoDB Atlas URI

### Installation
1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/Saiph45/inventory-system.git](https://github.com/Saiph45/inventory-system.git)
    cd inventory-system
    ```

2.  **Setup Backend:**
    ```bash
    cd server
    npm install
    # Create .env file and add:
    # MONGO_URI=your_mongodb_connection_string
    # PORT=5000
    node server.js
    ```

3.  **Setup Frontend:**
    ```bash
    cd client
    npm install
    npm run dev
    ```

---

## 🧪 API Endpoints
* `POST /api/auth/login` - User Login
* `GET /api/products` - Fetch Inventory
* `POST /api/products` - Add Item
* `POST /api/products/bulk` - **(New)** Bulk CSV Upload
* `GET /api/orders` - Fetch Sales History