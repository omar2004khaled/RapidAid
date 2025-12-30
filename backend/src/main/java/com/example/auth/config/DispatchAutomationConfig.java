// backend/src/main/java/com/example/auth/config/DispatchAutomationConfig.java
package com.example.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DispatchAutomationConfig {

    @Value("${dispatch.automation.enabled}")
    private volatile boolean enabled;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
