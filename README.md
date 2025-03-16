# AgriLink - Midterm Project

## Project Overview

AgriLink is a web application designed to connect local farmers with consumers, allowing farmers to list and manage their products and enabling users to browse and request fresh produce. The application includes user authentication (signup/login/logout), product management (CRUD operations), and a contact form for inquiries. It is built using a **Node.js/Express** backend with **MongoDB** for data storage and a **Vue.js** frontend for a dynamic user interface.

This project was developed as part of a midterm assignment and is deployed on Render at:  
**https://s25-midterm-project-yasli-k.onrender.com**

## Deployed Application

- **Client and Server URL**: [https://s25-midterm-project-yasli-k.onrender.com](https://s25-midterm-project-yasli-k.onrender.com)  
  (The client and server are deployed together as a single application.)

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB (via Mongoose), bcrypt (for password hashing), express-session (for session management), connect-mongo (for session storage)
- **Frontend**: Vue.js (v3), HTML, CSS
- **Deployment**: Render
- **Environment Management**: dotenv

## Data Model / Schema

The application uses MongoDB with Mongoose to define two primary schemas: `Farmer` and `Product`.

### Farmer Schema

Represents a farmer (user) in the system.

const farmerSchema = new Schema({
firstName: { type: String, required: [true, "Farmer must have a first name"] },
lastName: { type: String, required: [true, "Farmer must have a last name"] },
username: { type: String, required: [true, "Farmer must have a username"], unique: true },
email: { type: String, required: [true, "Farmer must have an email"], unique: true },
password: { type: String, required: [true, "Farmer must have a password"] },
});

- **Methods**:
  - `setPassword`: Asynchronously hashes the password using bcrypt.
  - `verifyPassword`: Compares a plain-text password with the stored hashed password.

### Product Schema

Represents a product listed by a farmer.

const productSchema = new Schema({
productName: { type: String, required: [true, "Product must have a name"] },
description: { type: String, required: [true, "Product must have a description"] },
price: { type: Number, required: [true, "Product must have a price"] },
imageURL: { type: String, required: [true, "Product must have an image"] },
location: { type: String, required: [true, "Product must have a location"] },
quantity: { type: Number, required: [true, "Product must have a quantity"] },
owner: { type: Schema.Types.ObjectId, ref: "Farmer", required: [true, "Product must have a farmer/owner"] },
});

- **Relationships**: The `owner` field references the `Farmer` model, linking each product to its creator.

## REST Endpoints

The backend provides the following RESTful endpoints for interacting with the application:

### Farmer Endpoints

| Method | Endpoint  | Description                                | Authentication Required | Request Body (if applicable)                         |
| ------ | --------- | ------------------------------------------ | ----------------------- | ---------------------------------------------------- |
| GET    | `/farmer` | Retrieve all farmers (excluding passwords) | No                      | N/A                                                  |
| POST   | `/farmer` | Sign up a new farmer and log them in       | No                      | `{ firstName, lastName, username, email, password }` |

### Session Endpoints

| Method | Endpoint   | Description                                 | Authentication Required | Request Body (if applicable) |
| ------ | ---------- | ------------------------------------------- | ----------------------- | ---------------------------- |
| GET    | `/session` | Check current session (returns farmer data) | Yes                     | N/A                          |
| POST   | `/session` | Log in a farmer                             | No                      | `{ username, password }`     |
| DELETE | `/session` | Log out the current farmer                  | No                      | N/A                          |

### Product Endpoints

| Method | Endpoint               | Description                                     | Authentication Required | Request Body (if applicable)                                        |
| ------ | ---------------------- | ----------------------------------------------- | ----------------------- | ------------------------------------------------------------------- |
| GET    | `/products`            | Retrieve all products with owner details        | No                      | N/A                                                                 |
| GET    | `/products/:productid` | Retrieve a single product by ID                 | No                      | N/A                                                                 |
| GET    | `/farmer/products`     | Retrieve products owned by the logged-in farmer | Yes                     | N/A                                                                 |
| POST   | `/products`            | Create a new product                            | Yes                     | `{ productName, description, price, imageURL, location, quantity }` |
| PUT    | `/products/:productid` | Update a product (owned by the farmer)          | Yes                     | `{ productName, description, price, imageURL, location, quantity }` |
| DELETE | `/products/:productid` | Delete a product (owned by the farmer)          | Yes                     | N/A                                                                 |

## Features

### Backend

- **User Authentication**: Farmers can sign up, log in, and log out. Passwords are securely hashed using bcrypt, and sessions are managed with express-session and stored in MongoDB.
- **Product Management**: Farmers can create, read, update, and delete (CRUD) their products. Only the owner of a product can update or delete it.
- **CORS**: Configured to allow requests from specific origins (localhost and Render deployment).
- **MongoDB Integration**: Connects to a MongoDB database using a connection string stored in an environment variable (`DBPASSWORDS`).

### Frontend

- **Dynamic UI**: Built with Vue.js, featuring pages for home, login, signup, dashboard, and product details.
- **Product Listing**: Displays all products with a search filter; logged-in farmers can view and manage their own products.
- **Forms**: Includes signup, login, add product, edit product, and contact forms with validation and notifications.
- **Session Persistence**: Uses local storage to maintain login state across page refreshes.
- **Notifications**: Displays success/error messages for user actions (e.g., login, product creation).

## Deployment

The application is deployed on Render at:  
**https://s25-midterm-project-yasli-k.onrender.com**

- The backend and frontend are bundled together and served from the same server.
- Environment variables (e.g., `DBPASSWORDS`) are configured in Render's dashboard.

## Usage

1. **Signup/Login**: Create a farmer account or log in to an existing one.
2. **Browse Products**: View all available products on the home page (no login required).
3. **Manage Products**: Logged-in farmers can add, edit, or delete their products from the dashboard.
4. **Contact**: Use the contact form to send inquiries (opens the user's email client).

## Author

Yasli K.
Created for web app 2 Midterm Project  
March 2025
