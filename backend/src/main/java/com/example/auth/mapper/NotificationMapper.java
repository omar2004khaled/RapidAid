package com.example.auth.mapper;

import com.example.auth.dto.NotificationRequest;
import com.example.auth.dto.NotificationResponse;
import com.example.auth.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NotificationMapper {

    @Mapping(target = "receiverUserId", source = "receiver.userId")
    @Mapping(target = "receiverUserName", source = "receiver.fullName")
    @Mapping(target = "relatedIncidentId", source = "relatedIncident.incidentId")
    @Mapping(target = "relatedIncidentType", source = "relatedIncident.incidentType")
    NotificationResponse toResponse(Notification notification);

    @Mapping(target = "receiver.userId", source = "receiverUserId")
    @Mapping(target = "relatedIncident.incidentId", source = "relatedIncidentId")
    Notification toEntity(NotificationRequest request);

    @Mapping(target = "receiver.userId", source = "receiverUserId")
    @Mapping(target = "relatedIncident.incidentId", source = "relatedIncidentId")
    void updateEntityFromRequest(NotificationRequest request, @MappingTarget Notification notification);
}
