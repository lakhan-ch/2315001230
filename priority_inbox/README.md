# Stage 6

## Priority Calculation

Priority Weight:

Placement = 3

Result = 2

Event = 1

Notifications are sorted using:

1. Notification Type Weight
2. Recency (Latest First)

## Efficient Maintenance

For continuous incoming notifications:

- Use Min Heap of size 10
- Complexity O(N log 10)
- Memory O(10)

This avoids sorting the entire dataset repeatedly.

## Approach

1. Fetch notifications from API.
2. Calculate priority score.
3. Sort by priority and recency.
4. Return top 10 notifications.