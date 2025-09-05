package com.spring.project.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

@RestController
/*@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.POST, RequestMethod.OPTIONS})*/
@RequestMapping("/api/stripe")
public class StripeController {

    @Value("${stripe.secret:}")
    private String stripeSecret;

    @PostMapping(value = "/create-checkout-session", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> createCheckoutSession(@RequestBody Map<String, Object> payload) {
        Map<String, Object> body = new HashMap<>();
        try {
            String secretKey = (stripeSecret != null && !stripeSecret.isEmpty())
                    ? stripeSecret
                    : System.getenv("STRIPE_SECRET_KEY");
            if (secretKey == null || secretKey.isEmpty()) {
                body.put("error", "Stripe secret key is not configured");
                body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
                return body;
            }
            Stripe.apiKey = secretKey;

            long amount = 0L;
            Object amt = payload.get("amount");
            if (amt instanceof Number) {
                amount = ((Number) amt).longValue();
            } else if (amt instanceof String) {
                try { amount = Long.parseLong((String) amt); } catch (NumberFormatException ignore) {}
            }
            if (amount <= 0) {
                body.put("error", "Invalid amount");
                body.put("status", HttpStatus.BAD_REQUEST.value());
                return body;
            }

            String successUrl = payload.getOrDefault("successUrl", "http://localhost:3000/mypage").toString();
            String cancelUrl = payload.getOrDefault("cancelUrl", "http://localhost:3000/purchase").toString();
            String buyerEmail = payload.getOrDefault("email", "test@nafal.com").toString();

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("krw")
                                .setUnitAmount(amount)
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("NAFAL 포인트 충전 " + amount + "원")
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .setCustomerEmail(buyerEmail)
                .build();

            Session session = Session.create(params);
            body.put("url", session.getUrl());
            body.put("status", HttpStatus.OK.value());
            return body;
        } catch (StripeException e) {
            body.put("error", e.getMessage());
            body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return body;
        } catch (Exception e) {
            body.put("error", "Unexpected error");
            body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            return body;
        }
    }
}


