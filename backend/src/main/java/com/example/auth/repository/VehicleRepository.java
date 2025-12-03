package com.example.auth.repository;

import com.example.auth.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    @Query (value = """
                    SELECT *
                    FROM vehicle
                    WHERE vehicle_id = :vehicleId
                                        """, nativeQuery = true)
    Optional<Vehicle> findVehicleById(Integer vehicleId);

    @Query (value = """
                    SELECT *
                    FROM vehicle
                    WHERE status = :status
                                        """, nativeQuery = true)
    List<Vehicle> findByStatus(String status);

}