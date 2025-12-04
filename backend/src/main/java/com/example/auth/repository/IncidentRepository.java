package com.example.auth.repository;

import com.example.auth.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Integer> {

    @Query(value = """
                        SELECT *
                        FROM incident
                        WHERE life_cycle_status = 'ACCEPTED'
                        ORDER BY severity_level DESC, time_reported ASC
                    """, nativeQuery = true)
    List<Incident> findAllAcceptedIncidentsOrderedBySeverityLevelAndTimeReported();

    @Query (value = """
                    SELECT *
                    FROM incident
                    WHERE life_cycle_status = 'RESOLVED'
                                        """, nativeQuery = true)
    List<Incident> findAllResolvedIncidents();

    @Query (value = """
                    SELECT *
                    FROM incident
                    WHERE life_cycle_status = 'REPORTED'
                                        """, nativeQuery = true)
    List<Incident> findAllReportedIncidents();


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