package com.example.auth.mapper;

import com.example.auth.dto.NotificationResponse;
import com.example.auth.entity.Incident;
import com.example.auth.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NotificationMapper {

    @Mapping(target = "serviceType", source = "relatedIncident.incidentType")
    NotificationResponse toResponse(Notification notification);


    @Mapping(target = "relatedIncident", source = "incident")
    Notification toEntity(Incident incident);
}
