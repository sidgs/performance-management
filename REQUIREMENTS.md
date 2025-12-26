# Performance Management System - Requirements Document

## 1. Overview

This document outlines the requirements for a Performance Management System that enables organizations to manage goals, conduct reviews, and facilitate peer-to-peer accolades. The system consists of three main layers: a Java-based API backend, a Google ADK agent layer, and a React-based UI frontend.

## 2. System Architecture

### 2.1 Technology Stack

**Backend (pulse-java-api)**
- Framework: Java Spring Boot
- Build & Dependency Management: Maven
- Persistence: JPA (Java Persistence API)
- Database: SQLite (local development), PostgreSQL (production)
- API Types: REST and GraphQL
- Server Context Path: `/api/v1/performance-management`
- Caching: Redis (disabled in local profile, enabled in non-local profiles)
- Build Tool: Makefile for build and run operations

**Agent Layer (agents-api)**
- Framework: Google ADK
- Functionality: Expose all GraphQL queries as tools to the agent layer

**Frontend (UI-app)**
- Framework: React
- Key Feature: Chatbot integration with AI agent for natural language interactions
- Primary Use: Read-only views and dashboards

### 2.2 Project Structure

```
performance-management/
├── pulse-java-api/          # Java Spring Boot backend
├── agents-api/        # Google ADK agent layer
└── UI-app/           # React frontend
```

## 3. Core Entities and Requirements

### 3.1 Goals

#### 3.1.1 Goal Structure
Goals are nested entities that can contain multiple sub-goals. Each goal must have:

**Required Fields:**
- Short description (text)
- Long description (text)
- Owner (reference to User)
- Creation date (date, format: yyyy-mm-dd)

**Optional Fields:**
- Completion date (date, format: yyyy-mm-dd)

**Hierarchical Structure:**
- A goal may have zero or more child goals (nested goals)
- Goals form a tree structure where parent-child relationships exist

**Status Values:**
- `DRAFT` - Goal is in draft form
- `APPROVED` - Goal has been approved
- `PUBLISHED` - Goal is published and visible
- `ACHIEVED` - Goal has been completed
- `RETIRED` - Goal is no longer active

#### 3.1.2 Goal Operations
- Create new goals
- Update existing goals
- Assign goals to users (one or more goals per user)
- View goal hierarchy
- Update goal status
- Retire goals
- Managers can assign goals to their team members

### 3.2 Users

#### 3.2.1 User Structure
Users represent individuals within the organization.

**Required Fields:**
- First name (text)
- Last name (text)
- Email (text, unique identifier)

**Optional Fields:**
- Title (text) - Job title within the organization
- Department (reference to Department)
- Manager (reference to User) - The user's manager

**Manager-Team Relationship:**
- A user may be a manager
- A manager can have multiple team members (users reporting to them)
- A manager can assign one or more goals to their team members

#### 3.2.2 User Operations
- Onboard new users
- Update user information
- Assign users to departments
- Assign managers to users
- Retire/deactivate users
- View user's assigned goals
- View user's team (if manager)

### 3.3 Departments

#### 3.3.1 Department Structure
Departments are nested organizational units.

**Required Fields:**
- Name (text)
- Small description (text)
- Owner (reference to User)
- Creation date (date, format: yyyy-mm-dd)
- Status (enum)

**Optional Fields:**
- Co-owner (reference to User)

**Status Values:**
- `ACTIVE` - Department is currently active
- `DEPRECATED` - Department is deprecated but still exists
- `RETIRED` - Department is no longer in use

**Hierarchical Structure:**
- Departments can be nested (parent-child relationships)
- A department can have multiple users
- A department must have an owner

#### 3.3.2 Department Operations
- Create new departments
- Update department information
- Assign users to departments
- Set department owners and co-owners
- View department hierarchy
- Retire/deprecate departments
- Onboard new departments

## 4. Authentication and Authorization

### 4.1 Authentication
- **Mock Login System**: Users authenticate using:
  - First name
  - Last name
  - Email address
- **Email as Unique Identifier**: Email address serves as the unique identifier for users throughout the system
- **User Context**: Email is used for:
  - Owner fields
  - Created by fields
  - Updated by fields

## 5. Data Format Standards

### 5.1 Date Format
- All dates must be in `yyyy-mm-dd` format (ISO 8601 date format)
- Example: `2024-01-15`

### 5.2 Time Format
- All times must use standard ISO 8601 format
- Example: `2024-01-15T14:30:00Z` or `2024-01-15T14:30:00+00:00`

## 6. API Requirements

### 6.1 API Types
The backend must expose:
- **REST APIs**: Standard REST endpoints for all CRUD operations
- **GraphQL APIs**: GraphQL schema and resolvers for all entities

### 6.2 API Base Path
- All API endpoints are served under the base context path: `/api/v1/performance-management`
- REST endpoints: `/api/v1/performance-management/users`, `/api/v1/performance-management/goals`, `/api/v1/performance-management/departments`
- GraphQL endpoint: `/api/v1/performance-management/graphql`

### 6.3 GraphQL Integration with Agent Layer
- All GraphQL queries must be exposed as tools to the Google ADK agent layer
- The agent layer should be able to execute GraphQL queries programmatically

### 6.4 Caching Strategy
- **Redis Caching**: Query operations are cached using Redis for improved performance
- **Profile-Based Activation**: Redis caching is disabled when running with `local` Spring profile
- **Cache Scope**: Only query operations are cached; mutations bypass cache or evict cache entries

## 7. User Interface Requirements

### 7.1 Primary UI Functions

#### 7.1.1 Data Management (Read-Only Views)
- View goals and goal hierarchies
- View users and their information
- View departments and department hierarchies
- View goal assignments
- View team structures

#### 7.1.2 Administrative Functions
- Onboard new users
- Onboard new departments
- Manage goals (view, navigate hierarchy)
- Manage users (view, update basic info)
- Manage departments (view, navigate hierarchy)
- Retire users
- Retire departments
- Update goal statuses

#### 7.1.3 Dashboards
The UI must provide dashboards for:
- Goal management overview
- Goal assignment tracking
- Goal creation metrics
- Goal status distribution
- User goal assignments
- Department goal assignments

### 7.2 Chatbot Integration

#### 7.2.1 Natural Language Interface
- **Primary Feature**: Chatbot that collaborates with the AI agent
- **Functionality**: Natural language processing for data updates
- **Use Cases**:
  - Create new goals via natural language
  - Update goal information
  - Assign goals to users
  - Update goal statuses
  - Create users
  - Create departments
  - Any other data modification operations

#### 7.2.2 Integration Architecture
- Chatbot in UI communicates with AI agent
- AI agent uses GraphQL APIs to perform operations
- UI displays read-only views of the data
- All write operations go through the chatbot/agent interface

## 8. Functional Requirements

### 8.1 Goal Management
1. **FR-GM-001**: System shall allow creation of goals with required and optional fields
2. **FR-GM-002**: System shall support nested goal hierarchies (parent-child relationships)
3. **FR-GM-003**: System shall allow assignment of one or more goals to users
4. **FR-GM-004**: System shall track goal status (DRAFT, APPROVED, PUBLISHED, ACHIEVED, RETIRED)
5. **FR-GM-005**: System shall allow managers to assign goals to their team members
6. **FR-GM-006**: System shall display goal hierarchies in a navigable format

### 8.2 User Management
1. **FR-UM-001**: System shall allow onboarding of new users with required fields
2. **FR-UM-002**: System shall support manager-team relationships
3. **FR-UM-003**: System shall allow assignment of users to departments
4. **FR-UM-004**: System shall allow retirement/deactivation of users
5. **FR-UM-005**: System shall display user's assigned goals
6. **FR-UM-006**: System shall display manager's team members

### 8.3 Department Management
1. **FR-DM-001**: System shall allow creation of departments with required fields
2. **FR-DM-002**: System shall support nested department hierarchies
3. **FR-DM-003**: System shall allow assignment of users to departments
4. **FR-DM-004**: System shall track department status (ACTIVE, DEPRECATED, RETIRED)
5. **FR-DM-005**: System shall allow setting of department owners and co-owners
6. **FR-DM-006**: System shall display department hierarchies

### 8.4 Authentication
1. **FR-AUTH-001**: System shall provide mock login using first name, last name, and email
2. **FR-AUTH-002**: System shall use email as unique identifier for all user references
3. **FR-AUTH-003**: System shall track created by and updated by using email identifier

### 8.5 API Requirements
1. **FR-API-001**: System shall expose REST APIs for all CRUD operations
2. **FR-API-002**: System shall expose GraphQL APIs for all entities
3. **FR-API-003**: System shall expose GraphQL queries as tools to the agent layer

### 8.6 UI Requirements
1. **FR-UI-001**: System shall provide read-only views for all entities
2. **FR-UI-002**: System shall provide dashboards for goal management, assignment, and status tracking
3. **FR-UI-003**: System shall provide chatbot interface for natural language interactions
4. **FR-UI-004**: System shall allow all data modifications through chatbot/agent interface
5. **FR-UI-005**: System shall display goal, user, and department hierarchies

## 9. Non-Functional Requirements

### 9.1 Data Format
1. **NFR-DF-001**: All dates must be stored and displayed in yyyy-mm-dd format
2. **NFR-DF-002**: All times must use ISO 8601 standard format

### 9.2 Database
1. **NFR-DB-001**: System shall use SQLite for local development environment
2. **NFR-DB-002**: System shall use PostgreSQL for production environment
3. **NFR-DB-003**: System shall use JPA for database persistence
4. **NFR-DB-004**: Database table names and column names shall use snake_case naming convention
5. **NFR-DB-005**: Java code shall use camelCase naming convention

### 9.3 Technology
1. **NFR-TECH-001**: Backend shall be built using Java Spring Boot
2. **NFR-TECH-002**: Backend shall use Maven for dependency and build management
3. **NFR-TECH-003**: Backend shall use Makefile for build and run operations
4. **NFR-TECH-004**: Agent layer shall be built using Google ADK
5. **NFR-TECH-005**: Frontend shall be built using React

### 9.4 Caching
1. **NFR-CACHE-001**: System shall use Redis for query result caching
2. **NFR-CACHE-002**: Redis caching shall be disabled when running with `local` Spring profile
3. **NFR-CACHE-003**: Redis caching shall be enabled for all non-local profiles (dev, staging, production)

## 10. Use Cases

### 10.1 Goal Creation via Chatbot
**Actor**: User (Manager)
**Precondition**: User is logged in
**Steps**:
1. User opens chatbot interface
2. User types: "Create a new goal for my team to improve customer satisfaction"
3. Chatbot processes request and queries for additional details if needed
4. AI agent calls GraphQL API to create goal
5. UI updates to show new goal in read-only view

### 10.2 Assign Goal to Team Member
**Actor**: Manager
**Precondition**: Manager is logged in, goal exists
**Steps**:
1. Manager opens chatbot
2. Manager types: "Assign the Q4 sales goal to John Smith"
3. Chatbot processes and validates user exists
4. AI agent calls GraphQL API to assign goal
5. UI updates to show goal assignment

### 10.3 View Goal Hierarchy
**Actor**: Any User
**Precondition**: User is logged in
**Steps**:
1. User navigates to Goals view in UI
2. System displays goal hierarchy
3. User can expand/collapse nested goals
4. User can view goal details (read-only)

### 10.4 Onboard New User
**Actor**: Administrator
**Precondition**: Administrator is logged in
**Steps**:
1. Administrator navigates to User Management
2. Administrator enters user details (first name, last name, email, optional fields)
3. System creates user with email as unique identifier
4. UI displays new user in user list

## 11. Data Model Summary

### 11.1 Entity Relationships
- **User** can have one Manager (User)
- **User** can have many Team Members (Users)
- **User** can be assigned many Goals
- **Goal** has one Owner (User)
- **Goal** can have many Child Goals
- **Goal** can be assigned to many Users
- **Department** has one Owner (User)
- **Department** can have one Co-owner (User, optional)
- **Department** can have many Users
- **Department** can have one Parent Department (optional, for nesting)

### 11.2 Key Constraints
- Email must be unique across all users
- Goals form a tree structure (no cycles)
- Departments form a tree structure (no cycles)
- All dates must be in yyyy-mm-dd format
- All times must be in ISO 8601 format

### 11.3 Naming Conventions
- **Database**: Table names and column names must use snake_case (e.g., `first_name`, `creation_date`, `parent_goal_id`)
- **Java Code**: Class names, method names, and field names must use camelCase (e.g., `firstName`, `creationDate`, `parentGoalId`)
- **JPA Mappings**: All entity classes must explicitly specify database column names using `@Column(name = "snake_case")` annotations

## 12. Future Considerations

This requirements document captures the initial scope. Future enhancements may include:
- Review and feedback system for goals
- Peer-to-peer accolades system
- Goal progress tracking
- Notifications and alerts
- Reporting and analytics
- Integration with external systems

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-15  
**Status**: Draft for Review
