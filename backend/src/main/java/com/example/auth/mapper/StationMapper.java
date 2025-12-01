package com.example.auth.mapper;

import com.example.auth.dto.StationRequest;
import com.example.auth.dto.StationResponse;
import com.example.auth.entity.Station;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {AddressMapper.class}, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface StationMapper {

    @Mapping(target = "address", source = "address")
    StationResponse toResponse(Station station);

    @Mapping(target = "address.addressId", source = "addressId")
    Station toEntity(StationRequest request);

    @Mapping(target = "address.addressId", source = "addressId")
    void updateEntityFromRequest(StationRequest request, @MappingTarget Station station);
}
