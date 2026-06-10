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

# Stage 2

## Database Choice

I recommend PostgreSQL because:

* Supports ACID transactions
* Reliable for large datasets
* Strong indexing support
* Efficient querying
* Easy scalability

## Database Schema

### students

| Column | Type    |
| ------ | ------- |
| id     | UUID    |
| name   | VARCHAR |
| email  | VARCHAR |

### notifications

| Column            | Type      |
| ----------------- | --------- |
| id                | UUID      |
| student_id        | UUID      |
| notification_type | ENUM      |
| message           | TEXT      |
| is_read           | BOOLEAN   |
| created_at        | TIMESTAMP |

## Relationships

* One student can have many notifications.
* Each notification belongs to one student.

## Potential Scaling Problems

As notification count increases:

1. Slow queries
2. High storage usage
3. Increased response time
4. Expensive sorting operations

## Solutions

### Indexing

```sql
CREATE INDEX idx_student_read
ON notifications(student_id,is_read);
```

### Partitioning

Partition notifications by month.

### Pagination

Return limited records per request.

### Archiving

Move old notifications to archive tables.

## Sample Queries

### Create Notification

```sql
INSERT INTO notifications
(id,student_id,notification_type,message,is_read,created_at)
VALUES
(uuid_generate_v4(),
'student-id',
'Placement',
'Google Hiring',
false,
NOW());
```

### Fetch Notifications

```sql
SELECT *
FROM notifications
WHERE student_id='student-id'
ORDER BY created_at DESC
LIMIT 20;
```

### Mark Read

```sql
UPDATE notifications
SET is_read=true
WHERE id='notification-id';
```

### Unread Count

```sql
SELECT COUNT(*)
FROM notifications
WHERE student_id='student-id'
AND is_read=false;
```