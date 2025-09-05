package com.spring.project.service;

import com.spring.project.common.NotificationSend;
import com.spring.project.controller.NotificationController;
import com.spring.project.repository.UserRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.*;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.servlet.http.HttpSession;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@EnableScheduling
public class RedisService {

    @Autowired
    RedisTemplate<String,Object> redisTemplate;
    private final String ACTIVE_USER_KEY ="user:1001:active";
    @Autowired
    JobLauncher jobLauncher;
    @Autowired
    Job job;

    @Autowired
    NotificationSend notificationSend;

    public void setValues(String key, String data) {
        ValueOperations<String, Object> values = redisTemplate.opsForValue();
        values.set(key, data);
    }

    public void setValues(String key, String data, Duration duration) {
        ValueOperations<String, Object> values = redisTemplate.opsForValue();
        values.set(key, data, duration);
    }

    @Transactional(readOnly = true)
    public String getValues(String key) {
        ValueOperations<String, Object> values = redisTemplate.opsForValue();
        Object value = values.get(key);
        return value != null? value.toString() : null;
    }

    public void deleteValues(String key) {
        redisTemplate.delete(key);
    }

    public void expireValues(String key, int timeout) {
        redisTemplate.expire(key, timeout, TimeUnit.MILLISECONDS);
    }

    public void setHashOps(String key, Map<String, String> data) {
        HashOperations<String, Object, Object> values = redisTemplate.opsForHash();
        values.putAll(key, data);
    }

    @Transactional(readOnly = true)
    public int getActiveUser() {
        HashOperations<String, Object, Object> values = redisTemplate.opsForHash();
        Map<Object, Object> entry = values.entries(ACTIVE_USER_KEY);
        Collection<Object> times = entry.values();
        int activeCount=0;
        for (Object object :times){
            String time = object.toString();
            System.out.println("가지고온 시간"+time);
            LocalDateTime localDateTime = LocalDateTime.parse(time);
            //현재 시간
            LocalDateTime current = LocalDateTime.now();
            //30일 기준
            LocalDateTime flag30 = current.minusDays(30);
            
            if (!localDateTime.isBefore(flag30)){
                activeCount++;
            }
        }
        return activeCount;
    }

    /*public void deleteHashOps(String key, String hashKey) {
        HashOperations<String, Object, Object> values = redisTemplate.opsForHash();
        values.delete();
    }*/

    public boolean checkExistsValue(String value) {
        return !value.equals("false");
    }
    public Set<Map.Entry<Object,Object>> getNewActivity(){
        HashOperations<String, Object, Object> values = redisTemplate.opsForHash();
        Set<Map.Entry<Object,Object>> entries = values.entries("nafal:newActivity").entrySet();
        //values.delete("nafal:newActivity");
        return entries;
    }

    //활성 사용자 저장
    /*key : userId
    * value : 로그인 시간*/
    public void saveActiveUser(String key,String value){
        HashOperations<String, String,String> ops = redisTemplate.opsForHash();
        ops.put(ACTIVE_USER_KEY,key,value);
    }

    /*최근 활동 저장
    * tag : 최근활동을 나타냄
    * key:활동 태그(상품등록,결제 등) -> RedisNewActivity (enum)
    * value : 상품명 등*/
    public void saveNew(String key, String value, HttpSession session){
        try{
            notificationSend.send(session,key,value);
            System.out.println("새로운 상품 저장");
            HashOperations<String, String,String> ops = redisTemplate.opsForHash();
            ops.put("nafal:newActivity",key+"_"+session.getId(),value);

        } catch (Exception e) {
            System.out.println("새로운 상품 저장 오류:"+e.getMessage());
        }
    }

    //활성 사용자 스케줄링 - 매일 자정 업데이트
    @Scheduled(cron = "0 0 0 * * ?", zone = "Asia/Seoul")
    public void updateActiveUser() throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException, JobParametersInvalidException, JobRestartException {
        System.out.println("활성 유저 업데이트:스케줄");
        JobParameters parameters = new JobParametersBuilder()
                .addLong("currentTime",System.currentTimeMillis())
                .toJobParameters();
        jobLauncher.run(job,parameters);
    }

}
