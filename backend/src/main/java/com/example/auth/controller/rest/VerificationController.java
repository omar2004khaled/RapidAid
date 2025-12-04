package com.example.auth.controller.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import com.example.auth.service.VerificationService;

@RestController
@RequestMapping("/auth")
@Tag(name = "Email Verification", description = "Email verification endpoints")
public class VerificationController {
    private final VerificationService verificationService;
    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @Operation(
            summary = "Verify email address",
            description = "Verifies a user's email address using the token sent to their email during registration."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Email verified successfully or error message",
                    content = @Content(
                            mediaType = "text/plain",
                            examples = @ExampleObject(value = "Email verified successfully!")
                    )
            )
    })
    @GetMapping("/verify")
    public String verify(
            @Parameter(description = "Verification token from email", required = true, example = "abc123verificationtoken")
            @RequestParam String token) {
        return verificationService.verify(token);
    }
}
