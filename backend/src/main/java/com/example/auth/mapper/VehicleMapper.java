package com.example.auth.mapper;

import com.example.auth.dto.VehicleRequest;
import com.example.auth.dto.VehicleResponse;
import com.example.auth.entity.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VehicleMapper {

    @Mapping(target = "driverUserId", source = "driver.userId")
    @Mapping(target = "driverName", source = "driver.fullName")
    VehicleResponse toResponse(Vehicle vehicle);

    @Mapping(target = "driver.userId", source = "driverUserId")
    Vehicle toEntity(VehicleRequest request);

    @Mapping(target = "driver.userId", source = "driverUserId")
    void updateEntityFromRequest(VehicleRequest request, @MappingTarget Vehicle vehicle);
}
