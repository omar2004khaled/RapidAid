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

    VehicleResponse toResponse(Vehicle vehicle);

    Vehicle toEntity(VehicleRequest request);

    void updateEntityFromRequest(VehicleRequest request, @MappingTarget Vehicle vehicle);
}
