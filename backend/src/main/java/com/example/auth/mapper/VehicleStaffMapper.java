package com.example.auth.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.auth.dto.VehicleStaffRequest;
import com.example.auth.dto.VehicleStaffResponse;
import com.example.auth.entity.VehicleStaff.VehicleStaff;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VehicleStaffMapper {

    @Mapping(target = "vehicleId", source = "vehicle.vehicleId")
    @Mapping(target = "vehicleRegistrationNumber", source = "vehicle.registrationNumber")
    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "userName", source = "user.fullName")
    VehicleStaffResponse toResponse(VehicleStaff vehicleStaff);

    @Mapping(target = "id.vehicleId", source = "vehicleId")
    @Mapping(target = "id.userId", source = "userId")
    @Mapping(target = "vehicle.vehicleId", source = "vehicleId")
    @Mapping(target = "user.userId", source = "userId")
    VehicleStaff toEntity(VehicleStaffRequest request);

    @Mapping(target = "id.vehicleId", source = "vehicleId")
    @Mapping(target = "id.userId", source = "userId")
    @Mapping(target = "vehicle.vehicleId", source = "vehicleId")
    @Mapping(target = "user.userId", source = "userId")
    void updateEntityFromRequest(VehicleStaffRequest request, @MappingTarget VehicleStaff vehicleStaff);
}
