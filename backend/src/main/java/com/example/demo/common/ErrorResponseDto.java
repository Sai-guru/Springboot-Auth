package com.example.demo.common;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/**
 * Standard error response body returned by the GlobalExceptionHandler.
 * Frontend can reliably parse this structure.
 */
@Getter
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponseDto {

    private int status;
    private String error;     // e.g. "Not Found", "Bad Request", "Forbidden"
    private String message;
    private String path;      // the request URI that caused the error
    private Instant timestamp;
    private List<String> details; // optional field-level errors

    public static ErrorResponseDto of(int status, String error, String message, String path) {
        return ErrorResponseDto.builder()
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }
}