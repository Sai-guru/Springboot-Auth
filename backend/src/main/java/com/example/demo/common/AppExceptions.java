package com.example.demo.common;


//   Structured exceptions so your GlobalExceptionHandler can return clean JSON errors which is pakka cool
 
public class AppExceptions {

    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException(String userId) {
            super("User not found: " + userId);
        }
    }

    public static class UserBannedException extends RuntimeException {
        public UserBannedException() {
            super("This account has been suspended.");
        }
    }

    public static class InvalidRoleException extends RuntimeException {
        public InvalidRoleException(String role) {
            super("Invalid role: " + role + ". Valid roles: ROLE_USER, ROLE_ADMIN, ROLE_OWNER");
        }
    }

    public static class RoleChangeNotAllowedException extends RuntimeException {
        public RoleChangeNotAllowedException(String message) {
            super(message);
        }
    }

    public static class SelfActionNotAllowedException extends RuntimeException {
        public SelfActionNotAllowedException(String message) {
            super(message);
        }
    }

    public static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }
}
