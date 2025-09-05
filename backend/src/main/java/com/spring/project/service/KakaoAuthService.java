package com.spring.project.service;

import com.spring.project.dto.UserDTO;

public interface KakaoAuthService {

    public UserDTO kakaoLoginOrSignup(String accessToken);

}
