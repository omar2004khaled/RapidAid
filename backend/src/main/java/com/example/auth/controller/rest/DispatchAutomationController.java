package com.example.auth.controller.rest;

import com.example.auth.config.DispatchAutomationConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dispatch-automation")
@RequiredArgsConstructor
public class DispatchAutomationController {

    private final DispatchAutomationConfig config;

    @GetMapping("/enabled")
    public boolean isEnabled() {
        return config.isEnabled();
    }

    @PostMapping("/enabled")
    public void setEnabled() {
        config.setEnabled(!config.isEnabled());
    }
}
