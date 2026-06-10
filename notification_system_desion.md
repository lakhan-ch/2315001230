# Notification System Design

## Architecture

Vehicle Maintenance Scheduler
        |
        v
Notification Service API
        |
        v
Logging Middleware
        |
        v
Notification Channels
   - Email
   - SMS
   - Push Notification

## Components

### 1. Vehicle Maintenance Scheduler
- Tracks maintenance schedules
- Generates notification events

### 2. Notification Service
- Receives notification requests
- Processes and routes notifications

### 3. Logging Middleware
- Logs request and response data
- Tracks notification status

### 4. Notification Channels
- Email Notifications
- SMS Notifications
- Push Notifications

## Flow

1. Maintenance due event occurs
2. Notification request generated
3. Logging middleware records request
4. Notification service processes request
5. Notification sent through selected channel
6. Response logged

## Technologies

- Node.js
- Express.js
- MongoDB
- REST API
- GitHub