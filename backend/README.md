# Sensor Data Backend

This project is a robust backend system for handling sensor data from industrial equipment. It provides APIs for data ingestion, retrieval, and analysis.

## Features

- Real-time sensor data ingestion
- CSV data ingestion for bulk uploads
- Average sensor data retrieval over specified time periods
- Authentication and authorization
- Rate limiting
- Health checks
- Caching with Redis
- Containerization with Docker

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- Redis
- Docker and Docker Compose (for containerized deployment)

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sensor-data-backend.git
   cd sensor-data-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Copy the `.env.example` file to `.env` and fill in your configuration details.

4. Set up the database:
   Run the SQL scripts in `database/init.sql` to set up your PostgreSQL database.

5. Start the server:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

## Running Tests

Run unit tests:
```
npm run test:unit
```

Run integration tests:
```
npm run test:integration
```

Run all tests:
```
npm test
```

## API Endpoints

- POST /api/auth/login - Authenticate user
- POST /api/sensor-data - Insert sensor data
- POST /api/ingest-csv - Ingest CSV data
- GET /api/average-sensor-data - Get average sensor data
- GET /health - Health check endpoint

## Deployment

To deploy using Docker:

1. Build the Docker image:
   ```
   docker build -t sensor-data-backend .
   ```

2. Run the containers:
   ```
   docker-compose up -d
   ```

