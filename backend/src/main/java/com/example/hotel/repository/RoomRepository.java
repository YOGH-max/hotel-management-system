package com.example.hotel.repository;
import com.example.hotel.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RoomRepository extends JpaRepository<Room, Long> {}
