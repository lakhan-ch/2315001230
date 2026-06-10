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

SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;

# Stage 3

## Query Analysis

### Given Query

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

### Is This Query Accurate?

Yes, it correctly fetches all unread notifications for student 1042 and sorts them by creation time.

### Why Is It Slow?

The database contains approximately:

- 50,000 students
- 5,000,000 notifications

Potential issues:

1. SELECT * fetches unnecessary columns.
2. Full table scans may occur without proper indexes.
3. Sorting large datasets is expensive.
4. Returning all unread notifications at once can create large result sets.
5. Increased I/O operations and memory usage.

### Recommended Index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

### Optimized Query

```sql
SELECT id,
       notification_type,
       message,
       createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

### Computational Cost

Without Index:

O(N)

Where N = Total notifications.

With Composite Index:

O(log N)

Database can directly locate matching records instead of scanning millions of rows.

### Should We Add Indexes On Every Column?

No.

Reasons:

- Consumes additional storage.
- Slows INSERT operations.
- Slows UPDATE operations.
- Many indexes may never be used.
- Increased maintenance overhead.

Indexes should only be added on frequently filtered, sorted, or joined columns.

### Query To Find Students Who Received Placement Notifications In Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notification_type = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

### Additional Improvements

1. Pagination using LIMIT and OFFSET.
2. Archiving old notifications.
3. Table partitioning by month or year.
4. Caching frequently accessed data using Redis.
5. Monitoring slow queries using database profiling tools.


# Stage 4

## Performance Problem

Currently notifications are fetched from the database every time a student opens the application. As the number of students and notifications grows, this creates excessive database load and increases response times.

## Proposed Solution

A combination of:

1. Pagination
2. Redis Caching
3. WebSocket-based Real-Time Updates
4. Database Indexing
5. Archival Strategy

should be used.

---

## 1. Pagination

Instead of loading all notifications:

```http
GET /notifications?page=1&limit=20
```

### Benefits

- Smaller payload size
- Faster API responses
- Reduced memory consumption
- Better user experience

### Tradeoff

- Additional API calls when users navigate pages

---

## 2. Redis Caching

Frequently accessed notifications should be cached.

### Flow

1. User requests notifications
2. Check Redis cache
3. If cache exists → return cached data
4. Otherwise fetch from DB and cache result

### Benefits

- Reduced database load
- Faster response times
- Better scalability

### Tradeoff

- Cache invalidation complexity
- Additional infrastructure cost

---

## 3. WebSocket Real-Time Updates

Instead of polling the server repeatedly:

- Client establishes WebSocket connection
- Server pushes notifications instantly

### Benefits

- Real-time delivery
- Reduced HTTP requests
- Improved user experience

### Tradeoff

- Persistent connection management
- Additional server resources

---

## 4. Database Indexing

Recommended Index:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

### Benefits

- Faster filtering
- Faster sorting
- Improved query performance

### Tradeoff

- Slightly slower insert and update operations

---

## 5. Archiving Old Notifications

Notifications older than a defined retention period should be moved to archive tables.

### Benefits

- Smaller active dataset
- Faster queries
- Improved maintenance

### Tradeoff

- Additional archive management

---

## Recommended Architecture

Client
↓
API Layer
↓
Redis Cache
↓
PostgreSQL Database
↓
Archive Storage

WebSocket Server handles real-time notification delivery independently.

## Expected Outcome

- Reduced database load
- Faster page load times
- Improved scalability
- Better user experience
- Support for millions of notifications