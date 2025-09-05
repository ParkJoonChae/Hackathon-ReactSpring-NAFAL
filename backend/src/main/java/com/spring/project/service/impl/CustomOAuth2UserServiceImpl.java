package com.spring.project.service.impl;

import java.util.Collections;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.spring.project.dto.UserDTO;
import com.spring.project.repository.UserRepository;
import com.spring.project.service.CustomOAuth2UserService;

@Service
public class CustomOAuth2UserServiceImpl extends DefaultOAuth2UserService implements CustomOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            OAuth2User oAuth2User = super.loadUser(userRequest);

            if (oAuth2User == null || oAuth2User.getAttributes() == null) {
                throw new OAuth2AuthenticationException(
                        new OAuth2Error("invalid_user_info_response", "OAuth2 �궗�슜�옄 �젙蹂닿� �뾾�뒿�땲�떎.", null));
            }

            Map<String, Object> attributes = oAuth2User.getAttributes();
            return processOAuth2User(attributes);

        } catch (Exception e) {
            System.out.println("OAuth2 �궗�슜�옄 濡쒕뱶 以� �삤瑜� 諛쒖깮: " + e.getMessage());
            e.printStackTrace();
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("oauth2_processing_error", "OAuth2 泥섎━ 以� �삤瑜섍� 諛쒖깮�뻽�뒿�땲�떎.", null), e);
        }
    }

    @Override
    public OAuth2User processOAuth2User(Map<String, Object> attributes) {
        try {
            // UserDTO 泥섎━ �썑 UserDTO �젙蹂대�� attributes�뿉 �룷�븿
            UserDTO userDTO = processUserData(attributes);

            // UserDTO �젙蹂대�� attributes�뿉 異붽��븯�뿬 �굹以묒뿉 �궗�슜�븷 �닔 �엳�룄濡� �븿
            Map<String, Object> modifiedAttributes = new java.util.HashMap<>(attributes);
            modifiedAttributes.put("userDTO", userDTO);

            // OAuth2User 諛섑솚
            return new DefaultOAuth2User(
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                    modifiedAttributes,
                    "id" // Google OAuth2�쓽 id �븘�뱶 �궗�슜
            );

        } catch (Exception e) {
            System.out.println("OAuth2 �궗�슜�옄 泥섎━ 以� �삤瑜� 諛쒖깮: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("OAuth2 �궗�슜�옄 泥섎━ �떎�뙣", e);
        }
    }

    private UserDTO processUserData(Map<String, Object> attributes) {
        // Google OAuth2 �쓳�떟�뿉�꽌 �궗�슜�옄 �젙蹂� 異붿텧
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String googleId = (String) attributes.get("id"); // OAuth2�쓽 id �븘�뱶

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("�씠硫붿씪 �젙蹂대�� 媛��졇�삱 �닔 �뾾�뒿�땲�떎.");
        }

        if (name == null || name.trim().isEmpty()) {
            name = email.split("@")[0]; // �씠硫붿씪�쓽 �궗�슜�옄紐� 遺�遺꾩쓣 湲곕낯 �씠由꾩쑝濡� �궗�슜
        }



        return null; // UserDTO瑜� 諛섑솚�븯�뿬 �굹以묒뿉 �궗�슜�븷 �닔 �엳�룄濡� �븿
    }
}
