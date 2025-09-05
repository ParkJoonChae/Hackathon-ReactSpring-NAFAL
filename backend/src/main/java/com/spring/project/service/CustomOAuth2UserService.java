package com.spring.project.service;

import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

public interface CustomOAuth2UserService {
    OAuth2User processOAuth2User(Map<String, Object> attributes);
}

