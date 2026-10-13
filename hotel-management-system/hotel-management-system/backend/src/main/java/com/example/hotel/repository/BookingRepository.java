package com.example.hotel.repository;
import com.example.hotel.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRoomIdAndStatusAndCheckInLessThanAndCheckOutGreaterThan(Long roomId, String status, LocalDate checkOut, LocalDate checkIn);
}
