# **Event Management System**

## **Project Overview**

The Event Management System is a comprehensive solution for managing events, including sessions, speakers, and participants. The system allows users to perform CRUD operations on events, manage nested resources, and generate detailed event reports in PDF format.

## **Features**

- **Event Management**: Create, read, update, and delete events.
- **Session and Speaker Management**: Nest sessions and assign speakers within events.
- **Participant Registration**: Register participants with validation to limit the number of attendees.
- **Detailed Reporting**: Generate PDF reports including sessions and participant details.

## **Technologies Used**

- **Node.js**: Backend server runtime.
- **Express.js**: Framework for building the API.
- **SQLite**: Database interaction and ORM.
- **pdfkit**: PDF generation libraries.

## **Project Structure**

```
/project-root
├── index.js
├── package.json
├── eventManager.db
├── test.http
└── README.md
```

## **Setup Instructions**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/anikethvarma/EventManagement
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   nodemon index.js
   ```
   The server will be available at `http://localhost:3000`.

## **API Endpoints**

### **Event Management**

- **GET /events**: Retrieve all events.
- **GET /sessions/:eventId**: Retrieve all sessions in event.
- **GET /participants/:eventId/**: Retrieve all participants in event.
- **POST /event**: Create a new event.

### **Session and Speaker Management**

- **POST /session/:eventId/**: Add a session to an event.
- **DELETE /session/:sessionId/**: Delete a session to an event.

### **Participant Registration**

- **POST /participant/:eventId**: Register a participant for a session.

### **PDF Generation**

- **GET /pdf/:eventId**: Generate and download a PDF report for an event.

## **Best Practices Followed**

- **RESTful API Design**: Endpoints are designed following REST principles.
- **Validation**: Input validation is implemented for all endpoints.
- **Error Handling**: Consistent error handling and logging throughout the application.
- **Dependency Injection**: (Optional) Used to enhance modularity and testability.

## **Testing**

- **Unit Tests**: Run tests using your preferred testing framework (e.g., Mocha, Jest).
  ```bash
  npm test
  ```

This `README.md` provides a clear overview of the project, setup instructions, and details about the implemented features and technologies.
