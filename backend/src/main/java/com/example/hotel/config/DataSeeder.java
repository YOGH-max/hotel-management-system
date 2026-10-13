package com.example.hotel.config;
import com.example.hotel.model.Room;
import com.example.hotel.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class DataSeeder {
    @Bean CommandLineRunner seedRooms(RoomRepository rooms) {
        return args -> {
            if (rooms.count() == 0) {
                rooms.save(new Room("101", "Standard", 2, 1800, "Comfortable room with queen bed and Wi-Fi."));
                rooms.save(new Room("202", "Deluxe", 2, 2800, "Spacious room with a city view."));
                rooms.save(new Room("303", "Family Suite", 4, 4500, "Large suite for families, with a separate sitting area."));
                rooms.save(new Room("404", "Premium", 2, 5200, "Premium room with king bed and complimentary breakfast."));
            }
        };
    }
}
