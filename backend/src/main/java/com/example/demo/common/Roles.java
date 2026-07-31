package com.example.demo.common;

public final class Roles {

    public static final String USER = "ROLE_USER";
    public static final String ADMIN = "ROLE_ADMIN";
    public static final String OWNER = "ROLE_OWNER";

    public static final String[] ALL_ROLES = {USER, ADMIN, OWNER};

    public static boolean isValid(String role) {
        if(role == null) return false;
        for (String r : ALL_ROLES) {
            if(r.equalsIgnoreCase(role)) return true;
    }
        return false;
    }
    private Roles() { // Private constructor to prevent instantiation
        }


}
