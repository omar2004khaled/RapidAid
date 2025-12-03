package com.example.auth.mapper;

import com.example.auth.dto.AddressRequest;
import com.example.auth.dto.AddressResponse;
import com.example.auth.entity.Address;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AddressMapper {

    AddressResponse toResponse(Address address);

    Address toEntity(AddressRequest request);

    void updateEntityFromRequest(AddressRequest request, @MappingTarget Address address);
}
