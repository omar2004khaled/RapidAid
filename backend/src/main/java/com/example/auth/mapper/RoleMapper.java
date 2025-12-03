package com.example.auth.mapper;

import com.example.auth.dto.RoleRequest;
import com.example.auth.dto.RoleResponse;
import com.example.auth.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoleMapper {

    RoleResponse toResponse(Role role);

    Role toEntity(RoleRequest request);

    void updateEntityFromRequest(RoleRequest request, @MappingTarget Role role);
}
