# API Endpoints Documentation for Frontend Agents

This document describes all available REST endpoints, including their required request bodies, response payloads, and expected HTTP status codes.

---

## ????? Students API

### 1. Get All Students
- **Endpoint:** `GET /api/Students`
- **Description:** Retrieves a list of all students.
- **Request Body:** None
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
]
```

### 2. Get Student by ID
- **Endpoint:** `GET /api/Students/{id}`
- **Description:** Retrieves a specific student by their `id`.
- **Request Body:** None
- **Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```
- **Error Response:** `404 Not Found` if student doesn't exist.

### 3. Create Student
- **Endpoint:** `POST /api/Students`
- **Description:** Creates a new student.
- **Request Body (application/json):**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com"
}
```
- **Response (201 Created):**
```json
{
  "id": 2,
  "name": "Jane Doe",
  "email": "jane.doe@example.com"
}
```

### 4. Update Student
- **Endpoint:** `PUT /api/Students/{id}`
- **Description:** Updates an existing student's details.
- **Request Body (application/json):**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```
- **Response (204 No Content):** Empty body.
- **Error Response:** `404 Not Found` if student doesn't exist.

### 5. Delete Student
- **Endpoint:** `DELETE /api/Students/{id}`
- **Description:** Deletes a student.
- **Request Body:** None
- **Response (204 No Content):** Empty body.
- **Error Response:** `404 Not Found` if student doesn't exist.

---

## ?? Courses API

### 1. Get All Courses
- **Endpoint:** `GET /api/Courses`
- **Description:** Retrieves a list of all courses.
- **Request Body:** None
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "courseName": "Mathematics 101",
    "description": "Introduction to basic mathematics."
  }
]
```

### 2. Get Course by ID
- **Endpoint:** `GET /api/Courses/{id}`
- **Description:** Retrieves a specific course by its `id`.
- **Request Body:** None
- **Response (200 OK):**
```json
{
  "id": 1,
  "courseName": "Mathematics 101",
  "description": "Introduction to basic mathematics."
}
```
- **Error Response:** `404 Not Found` if course doesn't exist.

### 3. Create Course
- **Endpoint:** `POST /api/Courses`
- **Description:** Creates a new course.
- **Request Body (application/json):**
```json
{
  "courseName": "Physics 101",
  "description": "Introduction to basic physics concepts."
}
```
- **Response (201 Created):**
```json
{
  "id": 2,
  "courseName": "Physics 101",
  "description": "Introduction to basic physics concepts."
}
```

### 4. Update Course
- **Endpoint:** `PUT /api/Courses/{id}`
- **Description:** Updates an existing course's details.
- **Request Body (application/json):**
```json
{
  "courseName": "Advanced Physics",
  "description": "Advanced topics in physics."
}
```
- **Response (204 No Content):** Empty body.
- **Error Response:** `404 Not Found` if course doesn't exist.

### 5. Delete Course
- **Endpoint:** `DELETE /api/Courses/{id}`
- **Description:** Deletes a course.
- **Request Body:** None
- **Response (204 No Content):** Empty body.
- **Error Response:** `404 Not Found` if course doesn't exist.

---

## ?? Enrollment API (Relationships)

### 1. Assign Course to Student
- **Endpoint:** `POST /api/Students/{id}/courses/{courseId}`
- **Description:** Enrolls a student in a specific course.
- **Request Body:** None
- **Response (204 No Content):** Empty body.

### 2. Remove Course from Student
- **Endpoint:** `DELETE /api/Students/{id}/courses/{courseId}`
- **Description:** Removes a student's enrollment from a specific course.
- **Request Body:** None
- **Response (204 No Content):** Empty body.

### 3. Get All Courses for a Student
- **Endpoint:** `GET /api/Students/{id}/courses`
- **Description:** Retrieves all courses a student is enrolled in.
- **Request Body:** None
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "courseName": "Mathematics 101",
    "description": "Introduction to basic mathematics."
  }
]
```

### 4. Get All Students in a Course
- **Endpoint:** `GET /api/Courses/{id}/students`
- **Description:** Retrieves all students enrolled in a specific course.
- **Request Body:** None
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
]
```

---

## ?? Real-Time Notifications (SignalR WebSockets)

The API provides real-time updates using SignalR. The React frontend can connect to the SignalR Hub to receive spontaneous events from the server (e.g., to update live dashboards or show toast notifications without polling).

### Connection Details
- **Hub Endpoint:** `/notificationHub` (e.g., `https://localhost:<port>/notificationHub`)
- **Required NPM Package:** `@microsoft/signalr`

### Server-to-Client Events

#### 1. `StudentEnrolled`
- **Triggered when:** A student is successfully enrolled in a course (`POST /api/Students/{id}/courses/{courseId}`).
- **Payload:**
```json
{
  "studentId": 1,
  "courseId": 2,
  "message": "Student 1 was successfully enrolled in course 2!"
}
```

### React Frontend Example

Here is a quick example of how an agent or frontend developer can connect to the hub using React:

```javascript
import { useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

export const useAppNotifications = () => {
    useEffect(() => {
        // Initialize the connection
        const connection = new HubConnectionBuilder()
            // Replace with your actual API base URL
            .withUrl("https://localhost:7142/notificationHub") 
            .withAutomaticReconnect()
            .build();

        // Register the event listener BEFORE starting the connection
        connection.on("StudentEnrolled", (data) => {
            console.log("New Event Received:", data.message);
            // Handle the event: show a toast, update dashboard counts, refetch list, etc.
        });

        // Start the connection
        connection.start()
            .then(() => console.log("Connected to Notification Hub"))
            .catch(err => console.error("SignalR Connection Error:", err));

        // Cleanup on unmount
        return () => {
            connection.stop();
        };
    }, []);
};
