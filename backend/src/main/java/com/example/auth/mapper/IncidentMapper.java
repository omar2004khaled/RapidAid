package com.example.auth.mapper;

import com.example.auth.dto.IncidentRequest;
import com.example.auth.dto.IncidentResponse;
import com.example.auth.entity.Incident;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {AddressMapper.class}, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface IncidentMapper {

    @Mapping(target = "reportedByUserId", source = "reportedByUser.userId")
    @Mapping(target = "reportedByUserName", source = "reportedByUser.fullName")
    @Mapping(target = "address", source = "address")
    IncidentResponse toResponse(Incident incident);

    @Mapping(target = "reportedByUser", ignore = true) // Handle manually in service
    @Mapping(target = "address", source = "address") // Use AddressMapper
    Incident toEntity(IncidentRequest request);

    @Mapping(target = "reportedByUser", ignore = true) // Handle manually in service
    @Mapping(target = "address", source = "address") // Use AddressMapper
    void updateEntityFromRequest(IncidentRequest request, @MappingTarget Incident incident);
}
