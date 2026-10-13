# Staywise — Hotel Management System

A full-stack hotel management MVP built with **React + Vite**, **Java 17 + Spring Boot**, **Spring Data JPA**, and an **H2 file database**. It includes room inventory, guest reservations, date-overlap availability validation, automatic bill calculation, search/filter, cancellation, and a responsive management dashboard.

> This is a portfolio/demo application. It does not process real payments and does not include production authentication or authorization.

## Features
- Dashboard cards for rooms, confirmed bookings, unique guests, and confirmed booking value
- Seeded room inventory with room type, capacity, description, and nightly rate
- Reservation form with guest details and date validation
- Backend validation to prevent overlapping confirmed reservations for the same room
- Automatic total: number of nights × nightly room rate
- Reservation search and status filtering
- Cancel reservation (keeps the record and changes status to `CANCELLED`)
- Responsive UI for desktop and mobile
- H2 file database persists data locally between backend restarts

## Prerequisites
- Java 17 or later
- Maven 3.8+ (or use your IDE's Maven integration)
- Node.js 20+ and npm
- VS Code or IntelliJ IDEA

## Run locally
Open two terminals.

### 1. Start the backend
```bash
cd backend
mvn spring-boot:run
```
The REST API starts at `http://localhost:8080`. The H2 console is at `http://localhost:8080/h2-console` with JDBC URL `jdbc:h2:file:./data/hoteldb`, username `sa`, and a blank password.

### 2. Start the frontend
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/rooms` | List rooms |
| GET | `/api/bookings` | List reservations |
| POST | `/api/bookings` | Validate and create a reservation |
| DELETE | `/api/bookings/{id}` | Cancel a reservation (soft cancellation) |

### Example reservation payload
```json
{
  "roomId": 1,
  "guestName": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+91 9876543210",
  "checkIn": "2026-11-10",
  "checkOut": "2026-11-12"
}
```
Dates must be future/current dates and check-out must be after check-in. The server calculates the amount; clients cannot set their own price.

## Project structure
```text
hotel-management-system/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/example/hotel/
│       ├── HotelManagementApplication.java
│       ├── config/DataSeeder.java
│       ├── controller/HotelController.java
│       ├── model/Booking.java
│       ├── model/Room.java
│       └── repository/
│           ├── BookingRepository.java
│           └── RoomRepository.java
└── frontend/
    ├── index.html
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── styles.css
```

## Test checklist
1. Start both servers and confirm that four rooms appear.
2. Create a booking for a future two-night stay.
3. Confirm the total equals two × the room's nightly rate.
4. Try booking the same room for overlapping dates; the API should reject it.
5. Book the same room for non-overlapping dates; it should succeed.
6. Search for the guest and filter by Confirmed.
7. Cancel a booking and confirm it remains in the list with Cancelled status.
8. Restart the backend and verify the H2 file database retains the bookings.

## GitHub setup
Create an empty GitHub repository named `hotel-management-system`, then from this project root:
```bash
git init
git add .
git commit -m "Build hotel management system MVP"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/hotel-management-system.git
git push -u origin main
```
Replace `YOUR-USERNAME` with your GitHub username. Do not commit passwords, API keys, or real guest information.

## Improvements to discuss in interviews
- Add JWT authentication and staff/admin roles
- Replace H2 with MySQL and add database migrations
- Add automated tests for booking overlap/date validation
- Add room maintenance status, invoices, tax, and payment-provider integration
- Deploy frontend and backend with environment-based API URLs
