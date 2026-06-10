import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem
} from "@mui/material";

function App() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("http://4.224.186.213/evaluation-service/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
      });
  }, []);

  const priorityWeight = {
    Placement: 3,
    Result: 2,
    Event: 1
  };

  const priorityNotifications = [...notifications]
    .sort((a, b) => {
      const wa = priorityWeight[a.Type] || 0;
      const wb = priorityWeight[b.Type] || 0;

      if (wa !== wb) return wb - wa;

      return (
        new Date(b.Timestamp) -
        new Date(a.Timestamp)
      );
    })
    .slice(0, 10);

  const filtered =
    filter === ""
      ? notifications
      : notifications.filter(
          (n) => n.Type === filter
        );

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 2 }}>
        Notification Dashboard
      </Typography>

      <Typography variant="h5" sx={{ mt: 4 }}>
        Priority Notifications
      </Typography>

      {priorityNotifications.map((n) => (
        <Card sx={{ mt: 2 }} key={n.ID}>
          <CardContent>
            <Typography>{n.Type}</Typography>
            <Typography>{n.Message}</Typography>
          </CardContent>
        </Card>
      ))}

      <Typography variant="h5" sx={{ mt: 4 }}>
        All Notifications
      </Typography>

      <Select
        value={filter}
        onChange={(e) =>
          setFilter(e.target.value)
        }
        sx={{ mt: 2 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Placement">
          Placement
        </MenuItem>
        <MenuItem value="Result">
          Result
        </MenuItem>
        <MenuItem value="Event">
          Event
        </MenuItem>
      </Select>

      {filtered.map((n) => (
        <Card sx={{ mt: 2 }} key={n.ID}>
          <CardContent>
            <Typography>{n.Type}</Typography>
            <Typography>{n.Message}</Typography>
            <Typography>
              {n.Timestamp}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}

export default App;