# Hospital Backend API

Express.js backend server with PostgreSQL database and authentication.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` file:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Setup Database

Create the database and run the schema:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hospital_db;

# Exit psql
\q

# Run schema
psql -U postgres -d hospital_db -f database/schema.sql
```

Or manually run the SQL commands from `database/schema.sql`.

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:8080`

## Running Tests

Run the comprehensive unit tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage
- **20 test cases** covering all authentication endpoints
- **100% statement coverage** on auth router
- **93.75% branch coverage**

See `__tests__/README.md` for detailed test documentation.

## API Endpoints

### Base URL
```
http://localhost:8080
```

### Health Check
- **GET** `/health` - Check server and database status

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "user"
}
```

#### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User Profile
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`

## Project Structure

```
be-hospital/
├── __tests__/
│   ├── auth.test.js     # Unit tests for auth router
│   └── README.md        # Test documentation
├── config/
│   └── database.js      # Database configuration
├── database/
│   └── schema.sql       # Database schema
├── middleware/
│   └── auth.js          # Authentication middleware
├── router/
│   └── auth.js          # Authentication routes
├── validate/
│   └── authValidation.js # Joi validation schemas
├── .env                 # Environment variables (gitignored)
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore file
├── index.js             # Main server file
├── package.json         # Dependencies
└── README.md            # Documentation
```

## Technologies Used

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **joi** - Request validation
- **uuid** - Unique ID generation
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **jest** - Testing framework
- **supertest** - HTTP assertions for testing

## Security Notes

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire after 7 days
- Make sure to change `JWT_SECRET` in production
- Never commit `.env` file to version control

## Development

To add more routes, create new files in the `router/` directory and import them in `index.js`.

Example:
```javascript
const newRouter = require('./router/newRouter');
app.use('/api/newroute', newRouter);
```

