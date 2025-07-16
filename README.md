# Bitespeed Identity Service

This project implements an Identity Reconciliation service for Bitespeed, designed to consolidate customer contact information based on email and phone numbers. It provides a single API endpoint to manage and link customer identities, ensuring data consistency and a unified view of customer interactions.

## Technology Stack
-   **Backend**: Node.js with TypeScript
-   **Framework**: Express.js
-   **Database**: PostgreSQL
-   **ORM**: Prisma

## Setup Instructions

Follow these steps to get the project up and running on your local machine.

### 1. Clone the Repository

```bash
git clone github.com/Aman-Singh-Kushwaha/bitespeed-assignment
cd bitespeed-assignment
```

### 2. Install Dependencies

This project uses `pnpm` as its package manager. If you don't have `pnpm` installed, you can install it via npm:

```bash
npm install -g pnpm
```

Then, install the project dependencies:

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project based on the `.env.example` (if provided, otherwise create it manually) and set your PostgreSQL database URL and desired port:

```
DATABASE_URL="postgresql://user:password@localhost:5432/bitespeed_db"
PORT=3000
```

Replace `user`, `password`, `localhost:5432`, and `bitespeed_db` with your actual database credentials and host.

### 4. Run Prisma Migrations & App

Apply the database schema to your PostgreSQL database:

```bash
npx prisma migrate dev --name init
```

This will create the `Contact` table and any other necessary database structures.


```bash
pnpm run dev
```

The server will typically run on `http://localhost:3000` (or the port specified in your `.env` file).

## API Usage

The service exposes a single `POST /identify` endpoint.

### Request

```http
POST /identify
Content-Type: application/json

{
  "email": "string",
  "phoneNumber": "string"
}
```

*   `email` (optional): The email address of the contact.
*   `phoneNumber` (optional): The phone number of the contact.

At least one of `email` or `phoneNumber` must be provided.

### Success Response (HTTP 200 OK)

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["primary-email@example.com", "secondary-email@example.com"],
    "phoneNumbers": ["123456", "789012"],
    "secondaryContactIds": [23, 45]
  }
}
```

### Error Responses

*   **HTTP 400 Bad Request**: If `email` or `phoneNumber` are not provided or are empty.
    ```json
    { "message": "Email or phone number must be provided." }
    ```
*   **HTTP 500 Internal Server Error**: For unexpected server-side issues.
    ```json
    { "message": "An internal server error occurred." }
    ```
