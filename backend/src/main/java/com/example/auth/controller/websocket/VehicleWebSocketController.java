package com.example.auth.controller.websocket;

import com.example.auth.dto.VehicleResponse;
import com.example.auth.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class VehicleWebSocketController {

    @Autowired
    private VehicleService vehicleService;

    @MessageMapping("/vehicle/available-refresh")
    @SendTo("/topic/vehicle/available")
    public List<VehicleResponse> refreshAvailableVehicle() {
        return vehicleService.getAvailableVehicles();
    }


}
