package com.spring.project.dto;

import com.spring.project.common.UserRole;
import lombok.Data;

import java.util.Date;
@Data
public class UserDTO {
    private int userId;
    private String username;
    private String passwordHash;
    private String name;
    private String email;
    private UserRole userType;
    private String phoneNumber;
    private Date createdAt;
    private int pointBalance;
    private Date recentAt; //최근 로그인한 기록
    private boolean canBid; // 추가된 필드


    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) { this.userId = userId; }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public int getPointBalance() {
        return pointBalance;
    }

    public void setPointBalance(int pointBalance) {
        this.pointBalance = pointBalance;
    }

    public UserRole getUserType() {
        return userType;
    }

    public void setUserType(UserRole userType) {
        this.userType = userType;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getRecentAt() {
        return recentAt;
    }

    public void setRecentAt(Date recentAt) {
        this.recentAt = recentAt;
    }

    public boolean isCanBid() {
        return canBid;
    }

    public void setCanBid(boolean canBid) {
        this.canBid = canBid;
    }

    // toString
    @Override
    public String toString() {
        return "UserDTO{" +"userId=" + userId + ", username='" + username  +", passwordHash='" + passwordHash +  ", name='" + name + ", phoneNumber='" + phoneNumber +
                ", pointBalance=" + pointBalance +
                ", userType='" + userType +
                ", createdAt=" + createdAt +
                ", canBid=" + canBid +
                "}";
    }
}
