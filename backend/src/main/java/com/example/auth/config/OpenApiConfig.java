package com.example.auth.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "RapidAid Emergency Dispatch API",
                version = "1.0",
                description = "Comprehensive API documentation for the RapidAid Emergency Dispatch System. " +
                        "This system handles emergency incident reporting, vehicle/responder assignment, " +
                        "real-time tracking, and user management.",
                contact = @Contact(
                        name = "RapidAid Team",
                        email = "support@rapidaid.com",
                        url = "https://rapidaid.com"
                ),
                license = @License(
                        name = "MIT License",
                        url = "https://opensource.org/licenses/MIT"
                )
        ),
        servers = {
                @Server(
                        description = "Local Development Server",
                        url = "http://localhost:8080"
                ),
                @Server(
                        description = "Production Server",
                        url = "https://api.rapidaid.com"
                )
        }
)
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT Authentication. Enter your JWT token obtained from the /auth/login endpoint.",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
