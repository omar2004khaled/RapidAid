package com.example.auth.enums;

import java.util.Map;

public enum ServiceType {
    MEDICAL,
    FIRE,
    POLICE;

    private static final Map<ServiceType, VehicleType> SERVICE_TYPE_MAP =
            Map.of(MEDICAL, VehicleType.AMBULANCE, FIRE, VehicleType.FIRE_TRUCK, POLICE, VehicleType.POLICE_CAR);

    public static VehicleType serviceToVehicle(ServiceType value) {
        return SERVICE_TYPE_MAP.get(value);
    }
}
