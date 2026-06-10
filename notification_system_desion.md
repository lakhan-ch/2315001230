# Stage 1

## Notification System REST API Design

### Base URL

/api/v1

### Common Headers

Request:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

Response:

```http
Content-Type: application/json
```

## 1. Get Notifications

### Endpoint

GET /notifications

### Query Params

* page
* limit
* notificationType

### Response

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "Google hiring",
      "isRead": false,
      "createdAt": "2025-06-10T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 10
}
```

## 2. Get Notification By ID

### Endpoint

GET /notifications/{id}

### Response

```json
{
  "id": "uuid",
  "type": "Event",
  "message": "Tech Fest",
  "isRead": false,
  "createdAt": "2025-06-10T10:00:00Z"
}
```

## 3. Mark Notification As Read

### Endpoint

PATCH /notifications/{id}/read

### Response

```json
{
  "success": true
}
```

## 4. Mark All Notifications As Read

### Endpoint

PATCH /notifications/read-all

### Response

```json
{
  "success": true
}
```

## 5. Create Notification

### Endpoint

POST /notifications

### Request

```json
{
  "type": "Placement",
  "message": "Microsoft Hiring"
}
```

### Response

```json
{
  "id": "uuid",
  "success": true
}
```

## Real-Time Notifications

Use WebSockets.

Flow:

1. User connects
2. Server maintains socket connection
3. New notification generated
4. Notification pushed instantly
5. Client updates UI without refresh
