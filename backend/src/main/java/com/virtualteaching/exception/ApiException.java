package com.virtualteaching.exception;

public class ApiException extends RuntimeException {
    public ApiException(String message) {
        super(message);
    }
}
