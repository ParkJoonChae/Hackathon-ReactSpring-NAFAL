package com.spring.project.controller;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import com.spring.project.common.RedisNewActivity;
import com.spring.project.service.ProductService;
import com.spring.project.service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/iamport")
public class IamportController {

    @Value("${iamport.apiKey:}")
    private String iamportApiKey;

    @Value("${iamport.apiSecret:}")
    private String iamportApiSecret;
    @Autowired
    private ProductService service;
    @Autowired
    private RedisService redisService;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @PostMapping(value = "/prepare", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> prepare(@RequestBody Map<String, Object> payload) {
        Map<String, Object> res = new HashMap<>();
        try {
            String token = requestAccessToken();
            if (token == null) {
                res.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
                res.put("error", "iamport token error");
                return res;
            }
            String merchantUid = String.valueOf(payload.get("merchant_uid"));
            long amount = Long.parseLong(String.valueOf(payload.get("amount")));
            URL url = new URL("https://api.iamport.kr/payments/prepare");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", token);
            conn.setDoOutput(true);
            Map<String, Object> body = new HashMap<>();
            body.put("merchant_uid", merchantUid);
            body.put("amount", amount);
            try (DataOutputStream os = new DataOutputStream(conn.getOutputStream())) {
                os.write(MAPPER.writeValueAsBytes(body));
            }
            int code = conn.getResponseCode();
            res.put("status", code == 200 ? HttpStatus.OK.value() : code);
            return res;
        } catch (Exception e) {
            res.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            res.put("error", e.getMessage());
            return res;
        }
    }

    @PostMapping(value = "/verify", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> verify(@RequestBody Map<String, Object> payload, HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        try {
            String token = requestAccessToken();
            if (token == null) {
                res.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
                res.put("error", "iamport token error");
                return res;
            }
            String impUid = String.valueOf(payload.get("imp_uid"));
            long expectedAmount = Long.parseLong(String.valueOf(payload.get("amount")));

            URL url = new URL("https://api.iamport.kr/payments/" + impUid);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Authorization", token);
            int code = conn.getResponseCode();
            if (code != 200) {
                res.put("status", code);
                res.put("error", "iamport payment lookup failed");
                return res;
            }
            //결제 성공 -> db 반영
            String orderId = payload.get("orderId").toString();
            service.updateOrderStatus(orderId);
            redisService.saveNew(String.valueOf(RedisNewActivity.PAYMENT),orderId,session);

            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                JsonNode root = MAPPER.readTree(br);
                JsonNode payment = root.path("response");
                String status = payment.path("status").asText();
                long amount = payment.path("amount").asLong();
                boolean verified = "paid".equals(status) && amount == expectedAmount;
                res.put("status", HttpStatus.OK.value());
                res.put("verified", verified);
                res.put("paid_status", status);
                res.put("paid_amount", amount);
                return res;
            }
        } catch (Exception e) {
            res.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            res.put("error", e.getMessage());
            return res;
        }
    }

    private String requestAccessToken() throws Exception {
        if (iamportApiKey == null || iamportApiSecret == null || iamportApiKey.isEmpty() || iamportApiSecret.isEmpty()) {
            return null;
        }
        URL url = new URL("https://api.iamport.kr/users/getToken");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        Map<String, Object> body = new HashMap<>();
        body.put("imp_key", iamportApiKey);
        body.put("imp_secret", iamportApiSecret);
        try (DataOutputStream os = new DataOutputStream(conn.getOutputStream())) {
            os.write(MAPPER.writeValueAsBytes(body));
        }
        int code = conn.getResponseCode();
        if (code != 200) return null;
        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            JsonNode root = MAPPER.readTree(br);
            return root.path("response").path("access_token").asText(null);
        }
    }
}


