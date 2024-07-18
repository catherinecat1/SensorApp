# Sensor App

## Overview

This application is designed to collect, store, and analyze sensor data from IoT devices. It provides real-time data ingestion, historical data analysis, and visualization capabilities through a RESTful API.

## Architecture

The application follows a microservices architecture:

- Backend: Node.js with Express.js
- Database: PostgreSQL for persistent storage
- Caching: Redis for improved performance
- Authentication: JWT for user authentication, custom authentication for IoT devices

## Pages

- Login Page. Please use Username: admin Password: password to login
![login](./frontend/preview/screensnapshot%202024-07-18%2009.55.17.png)  

- Dashboard. Refresh every 10 minutes.
![dashboard1](./frontend/preview/screensnapshot%202024-07-18%2010.36.45.png)  
![dashboard2](./frontend/preview/screensnapshot%202024-07-18%2010.37.04.png)  
![dashboard3](./frontend/preview/screensnapshot%202024-07-18%2010.38.20.png)  
![dashboard4](./frontend/preview/screensnapshot%202024-07-18%2010.38.32.png)  
![dashboard5](./frontend/preview/screensnapshot%202024-07-18%2010.39.01.png)

- Upload CSV.
![uploadCSV](./frontend/preview/screensnapshot%202024-07-18%2010.41.51.png)  

## Key Components

1. IoT Device Management
2. Sensor Data Management
3. Data Analysis
4. Caching
5. Authentication

## Authentication Mechanism

Our solution implements a two-tier authentication system:

1. User Authentication:
   - Uses JSON Web Tokens (JWT) for authenticating API requests.
   - Users log in with username and password, receiving a JWT upon successful authentication.
   - The JWT is included in the Authorization header for subsequent API requests.
   - JWTs are verified on the server side for each protected route.

2. IoT Device Authentication:
   - Each IoT device is registered with a unique `equipment_id` and `secret_key`. 
   - For data ingestion, devices must include their `secret_key` in the request headers as `x-secret-key`.
   - The server verifies these credentials against the `iot_devices` table in the database.
   - The `secret_key` is stored as a hashed value in the database for security.
   - This is a just a simple mock up for IoT Device Authentication. In real implementation, IoT developers and administrators usually register each device and deploy each one with public key infrastructure (PKI) that is linked to public key certificates for device authentication. PKI helps the IoT network to establish the legitimacy of a device in a network. However, every device should be able to verify the source of information in a system consisting of thousands of devices that are sending large volumes of data in milliseconds. So it is essential to have a trusted platform that can automatically handle device identity verification.

This dual approach ensures that both human users (through the frontend) and IoT devices can securely interact with our system, with appropriate access controls for each type of entity.

## API Endpoints

1. POST /api/auth/login - Authenticate user and receive JWT
2. POST /api/sensor-data - Send sensor data (requires IoT device authentication)
3. GET /api/average-sensor-data - Retrieve average sensor data
4. POST /api/ingest-csv - Batch upload sensor data via CSV
5. GET /api/latest-sensor-data - Retrieve latest sensor data
6. GET /api/latest-sensor-data-by-location - Retrieve latest sensor data grouped by location
7. GET /api/iot-devices - Retrieve list of all IoT devices

## Data Models

1. IoT Device:
   - equipment_id (PK): String
   - secret_key: String (hashed)
   - longitude: Float
   - latitude: Float

2. Sensor Data:
   - id (PK): Integer
   - equipment_id (FK): String
   - timestamp: DateTime
   - value: Float

## Deployment

TThe deployment process includes:

1. Setting up PostgreSQL and Redis containers
2. Configuring environment variables for database connections, Redis URL, and JWT secret
3. Running database migrations
4. Installing and starting the back-end using `npm install` and `npm start`. The server will be running on `http://localhost:3000/`
5. Generating dummy data using `generate-dummy-data`
6. Installing and starting the front-end using `npm install` and `npm start`. The App will be running on `http://localhost:3001/`

The application is also containerized using Docker and can be deployed using the provided `docker-compose.yml` file. A `deploy.sh` script is provided to automate the deployment process. (Didn't have time to test Docker file)

## Performance Report

The objective of this performance testing is to evaluate the performance of the Node.js back-end under various load scenarios. Specifically, we measure response time, throughput, error rate, and resource utilization under concurrent requests of 500, 1000, 5000, and 10000.

Test Environment:
- Server Configuration: Node.js server on MacBook Pro (Retina, 15-inch, Mid 2015) CPU 2.2 GHz Intel Core i7 
- Load Testing Tool: Artillery
- Endpoint Tested: /api/sensor-data

Test Scenarios:
The following scenarios were tested:
- 500 concurrent requests
- 1000 concurrent requests
- 5000 concurrent requests
- 10000 concurrent requests

Test Results for 500 Concurrent Requests:
- Total Requests: 30,000
- Total Responses: 24,044
- Successful Responses: 24,044 (80.1%)
- Failed Requests: 5,956 (19.9%)
- Errors:
   - ETIMEDOUT: 1,903
   - EPIPE: 334
   - ECONNRESET: 3,719
- Response Time Metrics: Mean (223.2ms) Median (71.5 ms) p95 (1,153.1ms)

Test Results for 1000 Concurrent Requests:
- Total Requests: 60,000
- Total Responses: 22,886
- Successful Responses: 22,886 (38.1%)
- Failed Requests: 37,114 (61.9%)
- Errors:
   - ETIMEDOUT: 18,831
   - EPIPE: 614
   - ECONNRESET: 17,669
- Response Time Metrics: Mean (292ms) Median (201.9ms) p95 (699.6ms)

Test Results for 5000 Concurrent Requests:
- Total Requests: 300,121
- Total Responses: 25,969
- Successful Responses: 25,969 (8.7%)
- Failed Requests: 229,152 (91.3%)
- Errors:
   - ETIMEDOUT: 200,028
   - EPIPE: 176
   - ECONNRESET: 28,948
- Response Time Metrics: Mean (341.6ms) Median (301.9ms) p95 (1130.6ms)

Test Results for 5000 Concurrent Requests:
- Total Requests: 600,486
- Total Responses: 19,294
- Successful Responses: 19,294 (7.0%)
- Failed Requests: 581,192 (93.0%)
- Errors:
   - ETIMEDOUT:  553,098
   - EPIPE: 38
   - ECONNRESET: 28,056
- Response Time Metrics: Mean (362ms) Median (353.1ms) p95 (1022.7ms)

Analysis:
1. The high number of ETIMEDOUT errors suggests that the server is unable to process requests in a timely manner.
2. ECONNRESET errors indicate that the server is actively refusing connections, likely due to resource exhaustion.

Next Step:
1. Implement aggressive horizontal scaling by adding more application servers behind a load balancer.
2. Optimize database queries and implement database sharding to distribute the load.
3. Enhance the caching strategy, possibly implementing a distributed cache like Redis Cluster.
4. Implement a robust queueing system (e.g., RabbitMQ, Apache Kafka) to handle incoming requests and process them asynchronously.
5. Optimize the application code to handle connections more efficiently, possibly using a more performant web server like Nginx as a reverse proxy.
6. Implement circuit breakers to fail fast and prevent cascading failures under high load.
7. Upgrade hardware resources (CPU, RAM, Network) to handle higher concurrency.

Conclusion:
Significant architectural changes and optimizations are required to achieve the desired performance levels. A redesign of the data ingestion and processing pipeline is necessary to meet these scalability requirements.

## Global Scaling Solution

As our application scales globally, we need to introduce new components and modify our architecture to ensure high availability, low latency, and consistency across regions. Here are the proposed changes:

1. Global Load Balancer:
   - Implement a global DNS-based load balancer to direct traffic to the nearest regional deployment.

2. Regional Deployments:
   - Set up multiple regional deployments, each containing:
     - Application servers
     - Redis cache
     - Read replicas of the PostgreSQL database

3. Central Master Database:
   - Maintain a central master PostgreSQL database for write operations.
   - Implement read replicas in each region for faster read operations.

4. Message Queue:
   - Introduce a distributed message queue (e.g., Apache Kafka) to handle high volumes of incoming sensor data. This allows for better handling of traffic spikes and provides a buffer if the processing layer is temporarily overloaded.

5. Data Processing Layer:
   - Implement a separate data processing layer to consume messages from the queue and write to the database.
   - This separation allows for independent scaling of the data ingestion and data processing components.

6. Content Delivery Network (CDN):
   - Utilize a CDN to serve static assets and potentially cache some API responses globally.

7. Monitoring and Logging:
   - Implement a global monitoring and logging solution to maintain visibility across all regional deployments.

8. Authentication Service:
   - Create a dedicated authentication service to handle user and device authentication across all regions.

Here's a diagram illustrating these changes:

               [Global DNS Load Balancer]
                            |
        +-------------------+-------------------+
        |                   |                   |
 [Region 1]           [Region 2]           [Region 3]
    |                     |                     |
    +- [App Servers]      +- [App Servers]      +- [App Servers]
    |                     |                     |
    +- [Redis Cache]      +- [Redis Cache]      +- [Redis Cache]
    |                     |                     |
    +- [DB Read Replica]  +- [DB Read Replica]  +- [DB Read Replica]
    |                     |                     |
    +- [Kafka Cluster]    +- [Kafka Cluster]    +- [Kafka Cluster]
    |                     |                     |
    +- [Data Processor]   +- [Data Processor]   +- [Data Processor]
        |                     |                     |
        +---------------------+---------------------+
                            |
                    [Central Master DB]
                            |
                   [Monitoring & Logging]
                            |
                  [Authentication Service]
                            |
                           CDN

