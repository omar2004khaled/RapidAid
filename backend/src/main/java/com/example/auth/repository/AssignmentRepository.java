package com.example.auth.repository;

import com.example.auth.entity.Assignment;
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

    @Query(value = """
                    SELECT *
                    FROM assignment
                    WHERE vehicle_id = :vehicleId
                    AND assignment_status != :status
                    """, nativeQuery = true)
    List<Assignment> findByVehicleVehicleIdAndAssignmentStatusNot(Integer vehicleId, String status);

    @Query(value = """
                        SELECT *
                        FROM assignment
                        WHERE incident_id = :incidentId
                        """, nativeQuery = true)
    List<Assignment> findByIncidentIncidentId(Integer incidentId);

    @Query(value = """
                    SELECT *
                    FROM assignment
                    WHERE assignment_status IN (:statuses)
                    """, nativeQuery = true)
    List<Assignment> findByAssignmentStatusIn(List<String> statuses);
}
