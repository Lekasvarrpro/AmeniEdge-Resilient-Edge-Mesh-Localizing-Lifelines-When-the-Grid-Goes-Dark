package com.ameniedge.auth.dto;

import com.ameniedge.users.Role;

public class AuthResponse {
    private String token;
    private String refreshToken;
    private String userId;
    private String username;
    private String fullName;
    private Role role;
    private String stationId;

    public AuthResponse() {}

    public AuthResponse(String token, String refreshToken, String userId, String username, String fullName, Role role, String stationId) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.stationId = stationId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }
}
