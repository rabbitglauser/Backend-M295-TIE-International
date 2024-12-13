# LB2: Backend with SQL for Crypto Registration Form 🚀

## 1. Preface 📄

### 1.1 Purpose 🎯
This document describes the tasks for LB2 of Module 295: Implementing the Back-End for an Application.

### 1.2 Prerequisites 🛠️
- A functional installation of Node.js.
- A provided project template.
- A code editor (recommended: Visual Studio Code).
- Docker installed on your system.

### 1.3 LB2 Details 📚
- **Tools Allowed:** Open Book
- **Weight:** 70%
- **Group Size:** Individual
- **Duration:**
  - 1-2 hours for initial setup on the first course day
  - 13 hours for programming work
- **Points:** 70
- **Grading:** Linear
- **Repository Name:** `LB2SQLModul295`

---

## 2. The Project: Backend with SQL for Crypto Registration Form 🛡️

### 2.1 General Description 📝
You will create a backend for a registration form that allows users to register for a cryptocurrency market. The backend should:

- Add users to the database only if their username or email does not already exist.
- Return a success code if registration is successful or an error code with a predefined error message if it fails.
- Use a combination of a database (Postgres) and a file system for storing data. 
- A base project setup will be provided as a Git repository by your instructor.

### 2.2 Technology Stack 💻
- **Node.js** with **TypeScript** and **ESLint** for backend development.
- Recommended libraries:
  - **Express** for server implementation.
  - **Multer** for file handling.
  - **Winston** for logging.

### 2.3 Setup ⚙️
Follow the instructions provided in the repository's README file to set up the project.

### 2.4 Database 🗄️
Define the database according to the given specifications. Ensure correct storage of all fields from the frontend form. These include:

- `name`
- `address`
- `city`
- `phoneNumber`
- `country`
- `username`
- `postcode`
- `password`
- `dateofbirth`
- `idconfirmation` (filename for ID images; multiple files possible)
- `email`

#### Additional Database Fields:
- `passwordsalt`
- `registrationTime`
- `isEmailConfirmed` (for email confirmation)

Define a primary key, ideally an auto-incrementing ID. Use an `init.sql` file to initialize the database with the structure similar to:

```sql
CREATE TABLE public.users (
  id SERIAL NOT NULL PRIMARY KEY,
  -- other fields
);
```

#### Managing Database Changes:
1. Rebuild the Docker container and image after updating `init.sql`.
2. Use the Postgres GUI or CLI to modify the database schema.

### 2.5 Server Implementation 🌐
Implement a Node.js server capable of handling the following:

- **POST Endpoint:** `/login` for receiving form data from the frontend.
- **Multipart Data Handling:** Extract data and files (e.g., `.pdf`, `.jpeg`, `.jpg`, `.png`).
- **Password Encryption:** Encrypt passwords using a suitable library and salt.
- **Duplicate Check:** Ensure the username or email does not already exist in the database.
- **Data Storage:** Save user data in the database and files in the filesystem upon successful registration.
- **Error Handling:**
  - Respond with `405` if the username or email already exists.
  - Remove uploaded files if registration fails.

Use **Multer** for file handling and **Express** for routing. Implement logging with **Winston**.

### 2.6 Additional Requirements ➕
- Store hashed passwords with their salt in the database.
- Include a flag (`isEmailConfirmed`) in the database to track email confirmation status.
- Allow querying stored filenames from the database.
- Implement an HTTPS server with a self-generated certificate.
- Remove files from the filesystem if registration fails due to duplicate username or email.

### 2.7 Frontend 🎨
- Use the provided frontend build.
- Serve the frontend statically using:

```javascript
app.use(express.static(path.resolve(__dirname, '../client/build')));
```

- Run the server on `localhost:3002`. Access the frontend at `http://localhost:3002`.
- Ensure correct usage of HTTP status codes:
  - `200`: Registration successful.
  - `400`: Form data issue (missing fields or files).
  - `405`: Duplicate username or email.

### 2.8 Optional Features 🧪
Implement functionality to clear the database to remove outdated or test data.

### 2.9 Testing 🧰
Use **Postman** to test your backend without relying on the frontend. Verify server responses to incorrect request formats and missing files.

---

## 3. Evaluation 🏆
### Grading Criteria:
1. **Functionality (60%)**
   - Correct database implementation.
   - Handling of duplicate usernames and emails.
   - Proper file processing.
   - Code clarity and documentation.
   - Frontend-backend communication.

2. **Security (17%)**
   - Proper password hashing and storage.
   - HTTPS server implementation.

3. **Logging (23%)**
   - Configurable logger.
   - Usage of various logging levels (e.g., warnings, errors).
   - Meaningful log messages.

Evaluation will include code inspection and **Postman** testing. Ensure that invalid users are not stored in the database.

---

## 4. Submission 📤
Submit your code by pushing it to the provided repository or as a zip file.

