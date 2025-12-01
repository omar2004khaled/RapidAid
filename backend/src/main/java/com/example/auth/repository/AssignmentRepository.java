package com.example.auth.repository;

import com.example.auth.entity.Assignment;
import com.example.auth.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Integer> {
    List<Assignment> findByVehicleVehicleIdAndAssignmentStatusNot(Integer vehicleId, AssignmentStatus status);
    List<Assignment> findByIncidentIncidentId(Integer incidentId);
}