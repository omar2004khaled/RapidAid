package com.example.auth.repository;

import com.example.auth.entity.Incident;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Integer> {

    @Query(value = """
                        SELECT *
                        FROM incident
                        WHERE life_cycle_status = 'REPORTED'
                        ORDER BY severity_level DESC, time_reported ASC LIMIT :#{#pageable.pageSize} OFFSET :#{#pageable.offset}
                    """, nativeQuery = true)
    Page<Incident> findAllReportedIncidentsOrderedBySeverityLevelAndTimeReported(Pageable pageable);

    @Query(value = """
                    SELECT *
                    FROM incident
                    WHERE incident_id = :incidentId
                                        """, nativeQuery = true)
    Optional<Incident> findIncidentById(Integer incidentId);

    @Query(value = """
                    UPDATE incident
                    SET severity_level = :priority
                    WHERE incident_id = :incidentId
                                        """, nativeQuery = true)
    void updatePriority(Integer incidentId, Integer priority);

    @Query(value = """
                    UPDATE incident
                    SET life_cycle_status = :status
                    WHERE incident_id = :incidentId
                                        """, nativeQuery = true)
    void updateStatus(Integer incidentId, String status);
}