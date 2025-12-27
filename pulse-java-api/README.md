
# Performance Management API

Java Spring Boot REST and GraphQL API for the Performance Management System.

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Build Tool**: Maven
- **Java Version**: 17
- **Database**: SQLite (development), PostgreSQL (production)
- **Persistence**: JPA/Hibernate
- **API Types**: REST and GraphQL

## Project Structure

```
pulse-java-api/
├── src/
│   ├── main/
│   │   ├── java/com/performancemanagement/
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── graphql/          # GraphQL resolvers
│   │   │   ├── model/            # JPA entities
│   │   │   ├── repository/       # JPA repositories
│   │   │   ├── service/          # Business logic services
│   │   │   └── PerformanceManagementApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── graphql/
│   │           └── schema.graphqls
│   └── test/
├── pom.xml
└── README.md
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

### Building the Project

```bash
cd pulse-java-api
mvn clean install
```

### Running the Application

```bash
mvn spring-boot:run
```

The API will be available at:
- REST API: `http://localhost:8080/api`
- GraphQL API: `http://localhost:8080/graphql`

## API Endpoints

### REST API

#### Users
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/{managerId}/team` - Get team members

#### Goals
- `POST /api/goals` - Create a new goal
- `GET /api/goals` - Get all goals
- `GET /api/goals/{id}` - Get goal by ID
- `GET /api/goals/owner/{email}` - Get goals by owner email
- `PUT /api/goals/{id}` - Update goal
- `POST /api/goals/{goalId}/assign/{userEmail}` - Assign goal to user
- `DELETE /api/goals/{id}` - Delete goal

#### Departments
- `POST /api/departments` - Create a new department
- `GET /api/departments` - Get all departments
- `GET /api/departments/{id}` - Get department by ID
- `GET /api/departments/root` - Get root departments (no parent)
- `PUT /api/departments/{id}` - Update department
- `POST /api/departments/{departmentId}/assign/{userEmail}` - Assign user to department
- `DELETE /api/departments/{id}` - Delete department

### GraphQL API

The GraphQL endpoint is available at `/graphql`. You can use the provided Postman collection to test GraphQL queries and mutations.

#### Example Queries

**Get all users:**
```graphql
query {
  users {
    id
    firstName
    lastName
    email
    title
  }
}
```

**Get goals by owner:**
```graphql
query {
  goalsByOwner(email: "john.doe@example.com") {
    id
    shortDescription
    status
    owner {
      email
    }
  }
}
```

#### Example Mutations

**Create a user:**
```graphql
mutation {
  createUser(input: {
    firstName: "John"
    lastName: "Doe"
    email: "john.doe@example.com"
    title: "Software Engineer"
  }) {
    id
    email
  }
}
```

**Create a goal:**
```graphql
mutation {
  createGoal(input: {
    shortDescription: "Improve customer satisfaction"
    longDescription: "Implement comprehensive feedback system"
    ownerEmail: "john.doe@example.com"
    creationDate: "2024-01-15"
    status: DRAFT
  }) {
    id
    shortDescription
    status
  }
}
```

## Database

The application uses SQLite for local development. The database file `performance_management.db` will be created automatically in the project root when you first run the application.

For production, configure PostgreSQL in `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/performance_management
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

## JWT Configuration

The API supports both signed and unsigned JWT tokens. By default, unsigned tokens are only allowed in `dev`, `local`, or `demo` profiles.

To explicitly enable unsigned JWT tokens, set the `JWT_ALLOW_UNSIGNED` environment variable to `true`, or configure `security.jwt.allow-unsigned=true` in `application.properties`. The environment variable takes precedence over the property configuration.

**Note**: Unsigned tokens are still validated for expiration and required claims (email, tenantId). Only signature verification is skipped when unsigned tokens are allowed.

## Testing with Postman

A Postman collection is provided at `Performance_Management_API.postman_collection.json`. Import this collection into Postman to test all API endpoints.

1. Open Postman
2. Click "Import"
3. Select the `Performance_Management_API.postman_collection.json` file
4. Set the `baseUrl` variable to `http://localhost:8080` (or your server URL)
5. Start testing!

## Data Models

### User
- Required: firstName, lastName, email (unique)
- Optional: title, department, manager
- Relationships: Can have manager, team members, assigned goals, owned goals/departments

### Goal
- Required: shortDescription, longDescription, owner, creationDate
- Optional: completionDate, parentGoal
- Status: DRAFT, APPROVED, PUBLISHED, ACHIEVED, RETIRED
- Relationships: Can have parent/child goals, assigned users

### Department
- Required: name, smallDescription, owner, creationDate, status
- Optional: coOwner, parentDepartment
- Status: ACTIVE, DEPRECATED, RETIRED
- Relationships: Can have parent/child departments, users

## Date Format

All dates must be in `yyyy-mm-dd` format (ISO 8601 date format).

Example: `2024-01-15`

## License

See LICENSE file in the project root.
