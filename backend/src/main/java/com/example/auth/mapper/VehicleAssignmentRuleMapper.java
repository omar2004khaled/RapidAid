package com.example.auth.mapper;

import com.example.auth.dto.VehicleAssignmentRuleRequest;
import com.example.auth.dto.VehicleAssignmentRuleResponse;
import com.example.auth.entity.VehicleAssignmentRule;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VehicleAssignmentRuleMapper {

    VehicleAssignmentRuleResponse toResponse(VehicleAssignmentRule rule);

    VehicleAssignmentRule toEntity(VehicleAssignmentRuleRequest request);

    void updateEntityFromRequest(VehicleAssignmentRuleRequest request, @MappingTarget VehicleAssignmentRule rule);
}
