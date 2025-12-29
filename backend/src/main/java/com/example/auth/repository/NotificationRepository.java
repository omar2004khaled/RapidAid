package com.example.auth.repository;

import com.example.auth.entity.Notification;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

        @Query(value = """
                        SELECT * FROM notification n
                        WHERE n.status = 'UNREAD'
                        """, nativeQuery = true)
        List<Notification> findAllUnreadNotifications();

        @Query(value = """
                        SELECT * FROM notification n
                        WHERE n.related_incident_id = :incidentId
                        """, nativeQuery = true)
        Notification findByRelatedIncidentId(@Param("incidentId") Integer incidentId);

        void deleteByRelatedIncidentIncidentId(Integer incidentId);
}
