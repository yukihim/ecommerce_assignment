# E-commerce Project with Medusa

## Overview

This project consists of a Medusa e-commerce backend and a Next.js storefront. The backend handles product management, order processing, and other commerce functionalities, while the storefront provides the user interface for customers.

## Project Structure

- `my-medusa-store/` - Medusa backend server (or admin page)
- `my-medusa-store-storefront/` - Next.js storefront application (UX/UI for customer)

## Prerequisites

- ‼️**IMPORTANT**‼️ Node.js (MUST BE: v20 or later)
- Docker (not optimized)

## Getting Started

### Docker initiation for database

1. ‼️**IMPORTANT**‼️ Open Docker app

2. Run docker-compose.yml:
   ```bash
   docker-compose up
   ```
3. Check for database in ecomstore_db. Input the command in Exec terminal of Docker
   psql -d ecomstore -U quan

   If the database does NOT exist, refer to section "Database does not exist" below.
   If the database exist, refer to section "Setting up the Medusa Server" below.

## Database does not exist

1. Navigate to the server directory:

   ```bash
   cd my-medusa-store
   ```

2. Run quick_start for setting up database, seed demo data and create admin user:

   ```bash
   npm run quick_start
   ```

3. Continue to step 2 of the next section

### Setting up the Medusa Server

1. Navigate to the server directory:

   ```bash
   cd my-medusa-store
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. ‼️**IMPORTANT**‼️ Set up environment variables: Check for .env file.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Log in:
   - mail: ad@mail.com
   - password: ad

### Setting up the Storefront

1. Navigate to the storefront directory:

   ```bash
   cd my-medusa-store-storefront
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. ‼️**IMPORTANT**‼️ Set up environment variables: Check for .env.local file.

4. ‼️**IMPORTANT**‼️ Replace NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in .env.local from [Key](http://localhost:9000/app/settings/publishable-api-keys)

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Delete the "\_medusa_jwt" cookies in F12 Developer Tools > Application > Cookies and reload the page.(If it exist)

7. Register a new user in Account tab

## Resources

- Coi mấy cái dev trong storefront hoặc admin thôi chứ host gì thì bỏ qua: [Build & Deploy Production Ready MedusaJS Shop](https://www.youtube.com/watch?v=XjMWSwoAOQc)
- [Medusa Documentation](https://docs.medusajs.com/learn)

## License

This project is licensed under the [MIT License](my-medusa-store-storefront/LICENSE).
