package com.example.auth.mapper;

import com.example.auth.dto.AssignmentRequest;
import com.example.auth.dto.AssignmentResponse;
import com.example.auth.entity.Assignment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AssignmentMapper {

    @Mapping(target = "incidentId", source = "incident.incidentId")
    @Mapping(target = "incidentType", source = "incident.incidentType")
    @Mapping(target = "vehicleId", source = "vehicle.vehicleId")
    @Mapping(target = "vehicleRegistrationNumber", source = "vehicle.registrationNumber")
    @Mapping(target = "assignedByUserId", source = "assignedBy.userId")
    @Mapping(target = "assignedByUserName", source = "assignedBy.fullName")
    AssignmentResponse toResponse(Assignment assignment);

    @Mapping(target = "incident.incidentId", source = "incidentId")
    @Mapping(target = "vehicle.vehicleId", source = "vehicleId")
    @Mapping(target = "assignedBy.userId", source = "assignedByUserId")
    Assignment toEntity(AssignmentRequest request);

    @Mapping(target = "incident.incidentId", source = "incidentId")
    @Mapping(target = "vehicle.vehicleId", source = "vehicleId")
    @Mapping(target = "assignedBy.userId", source = "assignedByUserId")
    void updateEntityFromRequest(AssignmentRequest request, @MappingTarget Assignment assignment);
}
