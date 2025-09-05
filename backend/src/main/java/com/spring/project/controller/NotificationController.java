package com.spring.project.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sse")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class NotificationController {

    public final static Map<String,SseEmitter> sseMap = new ConcurrentHashMap<>();

    @GetMapping("/")
    public SseEmitter connectionSse(HttpSession session){
        System.out.println("처음 sse 통신");
        SseEmitter sseEmitter = new SseEmitter(0L);
        sseMap.put(session.getId(),sseEmitter);



try{
    sseEmitter.send(SseEmitter.event()
            .name("notification_connection")
            .data("SUCCESS")
            .id(String.valueOf(System.currentTimeMillis())));
}catch (IOException e){
    System.out.println(e.getMessage());
}
//연결이 끊겼을 때
        sseEmitter.onCompletion(()->{sseMap.remove(session.getId());});
        sseEmitter.onTimeout(()->{sseMap.remove(session.getId());});
        
        
        return sseEmitter;
    }




}
