# Docker Run Guide

## Services

This project is dockerized with three containers:

- `db` (MySQL 8.4)
- `backend` (Spring Boot API)
- `frontend` (Angular app served by Nginx)

## 1) Start Docker daemon

On macOS, start Docker Desktop first.

## 2) Optional: set database root password

Create a `.env` file in the project root (same folder as `docker-compose.yml`):

```env
MYSQL_ROOT_PASSWORD=Kaveen@328
```

If `.env` is missing, `docker-compose.yml` uses the same default password.

## 3) Build and start all containers

```bash
docker compose up -d --build
```

## 4) Open the app

- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- MySQL: localhost:3306

## 5) Stop the stack

```bash
docker compose down
```

## 6) Stop and remove volumes (fresh DB)

```bash
docker compose down -v
```

## Notes

- Frontend proxies `/api` and `/uploads` to the backend container via Nginx.
- Backend stores uploaded property images in a named Docker volume (`uploads_data`).
- Database data is persisted in `mysql_data`.
