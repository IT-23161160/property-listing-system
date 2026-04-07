# Property Listing System

A full-stack real estate web application with role-based access for buyers, sellers, and admins.

## Site Features

- User authentication with JWT and role-based authorization
- Property listing, creation, update, and delete
- Property image upload and serving
- Category-based browsing
- Favorites management for buyers
- Booking workflow for buyers and sellers
- Review and rating support
- Admin panel for users, categories, properties, and bookings
- Profile management and password updates

## Architecture Used

This project uses a layered full-stack architecture:

- Frontend: Angular SPA (standalone components, route guards, HTTP services)
- Backend: Spring Boot REST API
- Security: Spring Security + JWT (stateless authentication)
- Data access: Spring Data JPA repositories
- Database: MySQL
- File storage: backend-managed local/volume directory for uploaded property images
- Deployment: Docker Compose with 3 containers
  - db (MySQL)
  - backend (Spring Boot)
  - frontend (Angular build served by Nginx)

### Logical Backend Layers

- Controller layer: request/response handling
- Service layer: business rules
- Repository layer: persistence and queries
- Model/DTO layer: domain and API payload structures

## DSA Concepts Used

- Binary Search Tree (BST)
  - Implemented in the backend price-order service to maintain ordered property traversal.
  - Related classes: PropertyBSTService and PropertyNode.
- QuickSort
  - Used for price-based sorting in PropertySortingService.
- Array/List collections
  - Used for filtering, traversal, and returning API response collections.

## OOP Concepts Used

- Encapsulation
  - Model classes encapsulate state and expose behavior through methods.
- Abstraction
  - Clear separation of concerns via controller, service, and repository layers.
- Inheritance
  - Repository interfaces inherit framework behavior from JpaRepository.
- Polymorphism
  - Interface-driven design with Spring-managed implementations and dependency injection.
- Composition and Dependency Injection
  - Services compose repositories and other services through constructor/field injection.

## Run With Docker

### Prerequisites

- Docker Desktop running

### Steps

1. From project root:

```bash
docker compose up -d --build
```

2. Open:

- Frontend: http://localhost:4200
- Backend API: http://localhost:8080/api
- MySQL: localhost:3306

3. Stop:

```bash
docker compose down
```

4. Stop and remove volumes for a clean database:

```bash
docker compose down -v
```

## Run Without Docker

### Prerequisites

- Java 21
- Maven (or use backend Maven wrapper)
- Node.js 20+
- npm
- MySQL 8+

### 1) Start MySQL locally

Use credentials/database that match backend config, or set environment variables.

Recommended environment variables before starting backend:

- SPRING_DATASOURCE_URL
- SPRING_DATASOURCE_USERNAME
- SPRING_DATASOURCE_PASSWORD

### 2) Run backend

From project root:

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs at http://localhost:8080

### 3) Run frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs at http://localhost:4200

## Why We Keep an Env File in This Repo

Normally, committing .env is not recommended.

For this project, we keep environment configuration in version control for setup simplicity and reproducible evaluation:

- .env.example is committed as the baseline configuration.
- Team members/evaluators can run the system quickly with consistent settings.
- The values are intended for local development/demo only, not production secrets.

For production, use secret managers or CI/CD environment variables and do not commit sensitive .env files.

## Default Admin Seed

On first startup, the backend seeds an admin account if it does not exist:

- Email: admin@gmail.com
- Password: admin123
