package com.example.hotel.model;

import jakarta.persistence.*;

@Entity
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String roomNumber;
    private String type;
    private int capacity;
    private double pricePerNight;
    private String description;

    public Room() {}
    public Room(String roomNumber, String type, int capacity, double pricePerNight, String description) {
        this.roomNumber = roomNumber; this.type = type; this.capacity = capacity;
        this.pricePerNight = pricePerNight; this.description = description;
    }
    public Long getId() { return id; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public double getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(double pricePerNight) { this.pricePerNight = pricePerNight; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
