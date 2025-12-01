package com.example.auth.mapper;

import com.example.auth.dto.SensorReadingRequest;
import com.example.auth.dto.SensorReadingResponse;
import com.example.auth.entity.SensorReading;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SensorReadingMapper {

    @Mapping(target = "sensorId", source = "sensor.sensorId")
    @Mapping(target = "sensorType", source = "sensor.sensorType")
    SensorReadingResponse toResponse(SensorReading sensorReading);

    @Mapping(target = "sensor.sensorId", source = "sensorId")
    SensorReading toEntity(SensorReadingRequest request);

    @Mapping(target = "sensor.sensorId", source = "sensorId")
    void updateEntityFromRequest(SensorReadingRequest request, @MappingTarget SensorReading sensorReading);
}
