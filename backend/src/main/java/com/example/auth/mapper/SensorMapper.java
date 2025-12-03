package com.example.auth.mapper;

import com.example.auth.dto.SensorRequest;
import com.example.auth.dto.SensorResponse;
import com.example.auth.entity.Sensor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SensorMapper {

    @Mapping(target = "vehicleId", source = "vehicle.vehicleId")
    @Mapping(target = "vehicleRegistrationNumber", source = "vehicle.registrationNumber")
    SensorResponse toResponse(Sensor sensor);

    @Mapping(target = "vehicle.vehicleId", source = "vehicleId")
    Sensor toEntity(SensorRequest request);

    @Mapping(target = "vehicle.vehicleId", source = "vehicleId")
    void updateEntityFromRequest(SensorRequest request, @MappingTarget Sensor sensor);
}
