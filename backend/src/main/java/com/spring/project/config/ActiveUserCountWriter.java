package com.spring.project.config;

import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
@Component
public class ActiveUserCountWriter implements ItemWriter<Integer> {
    @Autowired
    private RedisTemplate<String,Object> redisTemplate;

    @Override
    public void write(List<? extends Integer> list) throws Exception {
        if (list.isEmpty()) return;
        String key = "active_user_count:";
        Object value = list.get(0).toString();
        redisTemplate.opsForValue().set(key,value);
    }
}
