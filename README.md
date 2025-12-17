# RapidAid

A comprehensive emergency dispatch management system designed to streamline emergency response operations through real-time incident tracking, automated vehicle assignment, and integrated communication channels.

## Overview

RapidAid is a full-stack web application that facilitates efficient emergency response coordination. The system enables dispatchers to manage emergency incidents, automatically assigns appropriate vehicles to incidents, and provides real-time tracking of emergency units through WebSocket connections.

## Features

### Core Functionality
- **Incident Management**: Create, track, and manage emergency incidents with detailed location information
- **Automated Vehicle Assignment**: Intelligent assignment of emergency vehicles based on incident type, location, and vehicle availability
- **Real-Time Updates**: WebSocket-based communication for live incident status and vehicle location updates

### Authentication & Security
- JWT-based authentication with secure token management
- OAuth2 integration with Google Sign-In
- Email verification and password reset functionality
- Role-based authorization for API endpoints
- Secure password hashing and validation

### Vehicle Management
- Real-time vehicle tracking and status monitoring
- Vehicle type categorization (ambulance, fire truck, police car)
- Station-based vehicle organization
- Automated vehicle simulation for testing and demonstration
- Vehicle assignment history and analytics

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.4.1
- **Language**: Java 17
- **Database**: MySQL
- **Security**: Spring Security with JWT
- **WebSocket**: Spring WebSocket with STOMP protocol
- **Documentation**: SpringDoc OpenAPI (Swagger)
- **Build Tool**: Maven
- **Additional Libraries**:
  - MapStruct for object mapping
  - Lombok for boilerplate reduction
  - JUnit and Mockito for testing

### Frontend
- **Framework**: React 19.2.0
- **UI Library**: Material-UI (MUI) 7.3.5
- **Styling**: Tailwind CSS 3.4.18
- **Routing**: React Router DOM 7.9.6
- **HTTP Client**: Axios 1.13.2
- **WebSocket**: STOMP.js with SockJS
- **Build Tool**: Vite 7.2.2
- **Icons**: Lucide React

### Database
- MySQL with comprehensive schema including:
  - User and role management
  - Address geocoding
  - Incident tracking
  - Vehicle and station management
  - Assignment and notification systems
  - Sensor integration capability

## Project Structure

```
RapidAid/
├── backend/                    # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/auth/
│   │   │   │   ├── config/           # Security and WebSocket configuration
│   │   │   │   ├── controller/       # REST and WebSocket controllers
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   ├── entity/           # JPA entities
│   │   │   │   ├── enums/            # Enumeration types
│   │   │   │   ├── mapper/           # MapStruct mappers
│   │   │   │   ├── repository/       # Spring Data repositories
│   │   │   │   └── service/          # Business logic services
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── schema.sql
│   │   └── test/                     # Unit and integration tests
│   └── pom.xml
├── frontend/                   # React application
│   ├── public/
│   ├── src/
│   │   ├── Components/              # React components
│   │   │   ├── Profile/            # User and company profiles
│   │   │   ├── AuthRoute.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ...
│   │   ├── pages/                  # Page-level components
│   │   ├── services/               # API and WebSocket services
│   │   ├── assets/                 # Static resources
│   │   ├── css/                    # Component-specific styles
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── sql_scripts/                # Database initialization scripts
    └── emergency_dispatch.sql
```

## Prerequisites

- **Java Development Kit (JDK)**: Version 17 or higher
- **Node.js**: Version 16 or higher
- **MySQL**: Version 8.0 or higher
- **Maven**: Version 3.6 or higher (or use included Maven wrapper)
- **npm** or **yarn**: For frontend package management

## Installation

### Database Setup

1. Install and start MySQL server

2. Create the database:
   ```sql
   CREATE DATABASE emergency_dispatch_system;
   ```

3. Execute the initialization script:
   ```bash
   mysql -u root -p emergency_dispatch_system < sql_scripts/emergency_dispatch.sql
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Update database credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/emergency_dispatch_system
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. Configure JWT secret and OAuth2 credentials:
   ```properties
   jwt.secret=your_secure_secret_key_min_256_bits
   spring.security.oauth2.client.registration.google.client-id=your_client_id
   spring.security.oauth2.client.registration.google.client-secret=your_client_secret
   ```

4. Configure email settings for verification emails:
   ```properties
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   ```

5. Build the application:
   ```bash
   ./mvnw clean install
   ```

6. Run the backend server:
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend server will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API base URL in service files if needed (default is `http://localhost:8080`)

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend application will start on `http://localhost:5173`

## Usage

### Running the Application

1. Start the MySQL database server
2. Start the backend server (port 8080)
3. Start the frontend development server (port 5173)
4. Access the application at `http://localhost:5173`

### Default Roles

The system supports three primary roles:

- **Administrator**: Full system access, user management, and configuration
- **Dispatcher**: Incident creation, vehicle assignment, and monitoring
- **Responder**: View assigned incidents and update status

### API Documentation

Once the backend is running, access the interactive API documentation at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

### WebSocket Endpoints

The application uses WebSocket for real-time updates:

- **Connect**: `/ws` (STOMP over WebSocket)
- **Subscribe to incidents**: `/topic/incidents`
- **Subscribe to vehicle updates**: `/topic/vehicles`

## Development

### Backend Development

- **Run tests**:
  ```bash
  ./mvnw test
  ```

- **Generate test coverage report**:
  ```bash
  ./mvnw test jacoco:report
  ```
  View report at `target/site/jacoco/index.html`

- **Build without tests**:
  ```bash
  ./mvnw clean install -DskipTests
  ```

### Frontend Development

- **Run linter**:
  ```bash
  npm run lint
  ```

- **Build for production**:
  ```bash
  npm run build
  ```

- **Preview production build**:
  ```bash
  npm run preview
  ```

## Configuration

### Backend Configuration

Key configuration properties in `application.properties`:

- **Server Port**: `server.port=8080`
- **Database Connection**: `spring.datasource.*`
- **JWT Settings**: `jwt.secret` and `jwt.expiration-ms`
- **OAuth2 Configuration**: `spring.security.oauth2.client.*`
- **Email Configuration**: `spring.mail.*`
- **Vehicle Simulation**: `vehicle.simulation.*`

### Frontend Configuration

- **Vite Configuration**: `vite.config.js`
- **Tailwind Configuration**: `tailwind.config.js`
- **ESLint Configuration**: `eslint.config.js`

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/verify-email` - Verify email address

### Incidents
- `GET /api/incident` - List all incidents
- `POST /api/incident` - Create new incident
- `GET /api/incident/{id}` - Get incident details
- `PUT /api/incident/{id}` - Update incident
- `DELETE /api/incident/{id}` - Delete incident

### Vehicles
- `GET /api/vehicle` - List all vehicles
- `POST /api/vehicle` - Register new vehicle
- `GET /api/vehicle/{id}` - Get vehicle details
- `PUT /api/vehicle/{id}` - Update vehicle
- `GET /api/vehicle/available` - List available vehicles

### Assignments
- `GET /api/assignment` - List all assignments
- `POST /api/assignment` - Create assignment
- `PUT /api/assignment/{id}/status` - Update assignment status

### Users
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/pending` - List pending user approvals (admin)

## Testing

The backend includes comprehensive test coverage:

- **Unit Tests**: Service layer and repository tests
- **Integration Tests**: Controller and end-to-end tests
- **Security Tests**: Authentication and authorization tests

Run all tests:
```bash
cd backend
./mvnw test
```

## Deployment

### Backend Deployment

1. Build the production JAR:
   ```bash
   ./mvnw clean package -DskipTests
   ```

2. Run the JAR:
   ```bash
   java -jar target/demo-0.0.1-SNAPSHOT.jar
   ```

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your web server

### Environment Variables

For production deployment, externalize sensitive configuration:

```bash
export SPRING_DATASOURCE_PASSWORD=your_password
export JWT_SECRET=your_secret
export SPRING_MAIL_PASSWORD=your_mail_password
```

## Security Considerations

- Change default JWT secret before production deployment
- Use environment variables for sensitive credentials
- Enable HTTPS in production
- Configure CORS policies appropriately
- Regularly update dependencies for security patches
- Implement rate limiting for API endpoints
- Use secure WebSocket connections (WSS) in production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is developed as part of an academic or organizational initiative. Please contact the repository owner for licensing information.

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

## Acknowledgments

- Spring Boot framework and community
- React and the modern JavaScript ecosystem
- Material-UI for component library
- All open-source libraries and their contributors
