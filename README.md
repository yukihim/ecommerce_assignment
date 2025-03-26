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

### Setting up the Medusa Server

1. Navigate to the server directory:

   ```bash
   cd my-medusa-store
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. ‼️**IMPORTANT**‼️ Set up environment variables: Add the .env file i gave you on Messenger

4. ‼️**IMPORTANT**‼️ Run migration for demo data:

   ```bash
   npm run migration
   ```

5. ‼️**IMPORTANT**‼️ Create admin user:

   ```bash
   npm run ad
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Log in:
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

3. ‼️**IMPORTANT**‼️ Set up environment variables: Add the .env.local file i gave you on Messenger

4. ‼️**IMPORTANT**‼️ Replace NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY in .env.local from [Key](http://localhost:9000/app/settings/publishable-api-keys)

5. Start the development server:

   ```bash
   npm run dev
   ```

6. If encounter with an issue related to Regions. Setup a new region WITH AT LEAST ONE countries at [here](http://localhost:9000/app/settings/regions)

## Resources

- Coi mấy cái dev trong storefront hoặc admin thôi chứ host gì thì bỏ qua: [Build & Deploy Production Ready MedusaJS Shop](https://www.youtube.com/watch?v=XjMWSwoAOQc)
- [Medusa Documentation](https://docs.medusajs.com/learn)

## License

This project is licensed under the [MIT License](my-medusa-store-storefront/LICENSE).
