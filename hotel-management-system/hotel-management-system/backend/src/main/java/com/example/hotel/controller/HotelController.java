package com.example.hotel.controller;

import com.example.hotel.model.Booking;
import com.example.hotel.model.Room;
import com.example.hotel.repository.BookingRepository;
import com.example.hotel.repository.RoomRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class HotelController {
    private final RoomRepository rooms;
    private final BookingRepository bookings;
    public HotelController(RoomRepository rooms, BookingRepository bookings) { this.rooms = rooms; this.bookings = bookings; }

    @GetMapping("/rooms") public List<Room> getRooms() { return rooms.findAll(); }
    @GetMapping("/bookings") public List<Booking> getBookings() { return bookings.findAll().stream().sorted((a,b) -> b.getId().compareTo(a.getId())).toList(); }

    @PostMapping("/bookings") @ResponseStatus(HttpStatus.CREATED)
    public Booking createBooking(@Valid @RequestBody BookingRequest request) {
        if (request.guestName() == null || request.guestName().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest name is required.");
        if (request.email() == null || !request.email().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid email address.");
        if (request.checkIn() == null || request.checkOut() == null || !request.checkOut().isAfter(request.checkIn())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out must be after check-in.");
        if (request.checkIn().isBefore(LocalDate.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-in cannot be in the past.");
        if (request.roomId() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a room.");
        Room room = rooms.findById(request.roomId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found."));
        boolean occupied = !bookings.findByRoomIdAndStatusAndCheckInLessThanAndCheckOutGreaterThan(room.getId(), "CONFIRMED", request.checkOut(), request.checkIn()).isEmpty();
        if (occupied) throw new ResponseStatusException(HttpStatus.CONFLICT, "This room is already booked for those dates. Choose another room or dates.");
        long nights = ChronoUnit.DAYS.between(request.checkIn(), request.checkOut());
        Booking booking = new Booking();
        booking.setGuestName(request.guestName().trim()); booking.setEmail(request.email().trim()); booking.setPhone(request.phone() == null ? "" : request.phone().trim());
        booking.setRoomId(room.getId()); booking.setRoomNumber(room.getRoomNumber()); booking.setCheckIn(request.checkIn()); booking.setCheckOut(request.checkOut());
        booking.setNights(nights); booking.setTotalAmount(nights * room.getPricePerNight()); booking.setStatus("CONFIRMED");
        return bookings.save(booking);
    }

    @DeleteMapping("/bookings/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelBooking(@PathVariable Long id) {
        Booking booking = bookings.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found."));
        booking.setStatus("CANCELLED"); bookings.save(booking);
    }

    public record BookingRequest(Long roomId, String guestName, String email, String phone,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {}
}
