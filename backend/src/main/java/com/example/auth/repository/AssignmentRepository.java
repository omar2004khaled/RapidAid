package com.example.auth.repository;

import com.example.auth.entity.Assignment;
import com.example.auth.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Integer> {
    @Query(value = """
                        SELECT *
                        FROM assignment
                        WHERE assignment_status = :status
                    """, nativeQuery = true)
    List<Assignment> findByAssignmentStatus(String status);

    List<Assignment> findByVehicleVehicleIdAndAssignmentStatusNot(Integer vehicleId, AssignmentStatus status);
    List<Assignment> findByIncidentIncidentId(Integer incidentId);
}
