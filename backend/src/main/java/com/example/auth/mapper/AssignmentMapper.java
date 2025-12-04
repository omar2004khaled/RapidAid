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

    @Mapping(target = "incident", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "assignedBy", ignore = true)
    @Mapping(target = "assignmentId", ignore = true)
    @Mapping(target = "assignedAt", ignore = true)
    @Mapping(target = "acceptedAt", ignore = true)
    @Mapping(target = "arrivedAt", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "preferredVehicleTypes", ignore = true)
    Assignment toEntity(AssignmentRequest request);

    @Mapping(target = "incident", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "assignedBy", ignore = true)
    @Mapping(target = "assignmentId", ignore = true)
    @Mapping(target = "assignedAt", ignore = true)
    @Mapping(target = "acceptedAt", ignore = true)
    @Mapping(target = "arrivedAt", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "preferredVehicleTypes", ignore = true)
    void updateEntityFromRequest(AssignmentRequest request, @MappingTarget Assignment assignment);
}
