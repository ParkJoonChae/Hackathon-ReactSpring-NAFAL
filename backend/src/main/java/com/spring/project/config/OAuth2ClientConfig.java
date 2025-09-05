package com.spring.project.config;
import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

// @Configuration // 임시 비활성화 - application.properties 설정 사용
// @Configuration
public class OAuth2ClientConfig {

    // @Bean // 임시 비활성화
    // @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(this.googleClientRegistration());
    }

    private ClientRegistration googleClientRegistration() {
        return ClientRegistration.withRegistrationId("google")
                .clientId("${GOOGLE_CLIENT_ID:your-google-client-id}")
                .clientSecret("${GOOGLE_CLIENT_SECRET:your-google-client-secret}")
                .clientAuthenticationMethod(ClientAuthenticationMethod.BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUriTemplate("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("profile", "email") // openid 제거 - 일반 OAuth2만 사용
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v2/userinfo") // 일반 OAuth2 userinfo endpoint
                .userNameAttributeName("id") // Google OAuth2 사용자 ID
                .clientName("Google")
                .build();
    }
}

