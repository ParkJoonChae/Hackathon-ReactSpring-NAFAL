package com.spring.project.common;

import com.spring.project.controller.NotificationController;
import com.spring.project.controller.UserController;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Collection;
import java.util.Map;
import java.util.Set;

import static com.spring.project.common.RedisNewActivity.*;

@Component
public class NotificationSend {


    public void send(HttpSession session,String key,String value){
        System.out.println("알림시작");
        Map<String,SseEmitter> map = NotificationController.sseMap;
        System.out.println("확인222"+map.size());
        for (String s : map.keySet()){
            System.out.println("xxx"+s);
        }
      /*  for (String sse_key : map.keySet()){*/
            //Collection<HttpSession> objects = UserController.SESSION_MAP.values();
            Set<Map.Entry<String, HttpSession>> objects2 = UserController.SESSION_MAP.entrySet();
            for (Map.Entry<String,HttpSession> entry : objects2){
                String sessionId = entry.getValue().getId();
                // ADMIN 세션 ID 출력
                System.out.println("현재 확인 중인 세션 - Key: " + entry.getKey() + ", SessionId: " + sessionId);

                // ADMIN의 SSE 연결 확인
                SseEmitter adminEmitter = map.get(sessionId);
                System.out.println("확인"+adminEmitter);
                if (adminEmitter != null && entry.getKey().equals("ADMIN")){
                    System.out.println("알림보내는 중:");
                    String message = "";
                    try{
                        RedisNewActivity redisNewActivity = RedisNewActivity.valueOf(key);
                        switch (redisNewActivity){
                            case PRODUCT:
                                message = "상품'" + value + "'가 등록되었습니다.";
                                break;
                            case AUCTION:
                                message = "경매'" + value + "'이 종료되었습니다.";
                                break;
                            case PAYMENT:
                                message = "새 사용자'" + value + "'이 가입했습니다.";
                                break;
                            case REGISTER:
                                message = "결재'PAYMENT_" + value + "'이 완료되었습니다.";
                                break;
                        }
                        adminEmitter.send(SseEmitter.event()
                                .name("notification")
                                .data(message)
                                .id(String.valueOf(System.currentTimeMillis())),
                                MediaType.parseMediaType("text/event-stream;charset=UTF-8"));

                    } catch (IOException e) {
                        NotificationController.sseMap.remove(sessionId); // session.getId() 대신 sessionId 사용
                        System.out.println("알림 중 실패:" + e.getMessage());
                    }
                }
            }


           /* for (HttpSession httpSession : objects){
               String sessionId = httpSession.getId();
               if (map.get(sessionId) != null && ){
                   System.out.println("알림보내는 중:"+session.getId());
                   String message = "";
                   try{
                       RedisNewActivity redisNewActivity = RedisNewActivity.valueOf(key);
                       switch (redisNewActivity){
                           case PRODUCT:
                               message = "상품'" + value + "'가 등록되었습니다.";
                               break;
                           case AUCTION:
                               message = "경매'" + value + "'이 종료되었습니다.";
                               break;
                           case PAYMENT:
                               message = "새 사용자'" + value + "'이 가입했습니다.";
                               break;
                           case REGISTER:
                               message = "결재'PAYMENT_" + value + "'이 완료되었습니다.";
                               break;
                       }
                       sseEmitter.send(SseEmitter.event()
                               .name("notification")
                               .data(message)
                               .id(String.valueOf(System.currentTimeMillis())));

                   } catch (IOException e) {
                       NotificationController.sseMap.remove(session.getId()); // 전송 실패 시 제거
                       System.out.println("알림 중 실패:"+e.getMessage());
                   }
               }
            }*/

       // }
       /* if (sseEmitter != null && session.getAttribute("userRole") ==UserRole.ADMIN){
            System.out.println("알림보내는 중:"+session.getId());
            String message = "";
            try{
                    RedisNewActivity redisNewActivity = RedisNewActivity.valueOf(key);
                    switch (redisNewActivity){
                        case PRODUCT:
                            message = "상품'" + value + "'가 등록되었습니다.";
                            break;
                        case AUCTION:
                            message = "경매'" + value + "'이 종료되었습니다.";
                            break;
                        case PAYMENT:
                            message = "새 사용자'" + value + "'이 가입했습니다.";
                            break;
                        case REGISTER:
                            message = "결재'PAYMENT_" + value + "'이 완료되었습니다.";
                            break;
                    }
                    sseEmitter.send(SseEmitter.event()
                            .name("notification")
                            .data(message)
                            .id(String.valueOf(System.currentTimeMillis())));

            } catch (IOException e) {
                NotificationController.sseMap.remove(session.getId()); // 전송 실패 시 제거
                System.out.println("알림 중 실패:"+e.getMessage());
            }
        }*/
    }
}
