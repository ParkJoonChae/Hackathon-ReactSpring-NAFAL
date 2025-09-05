package com.spring.project.config;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.NonTransientResourceException;
import org.springframework.batch.item.ParseException;
import org.springframework.batch.item.UnexpectedInputException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class RedisReader implements ItemReader<Map<String,String>> {
    private final RedisTemplate<String,Object> redisTemplate;
    private final String ACTIVE_USER_KEY ="user:1001:active";
    private Map<String,String> resultMap = null;
    private Iterator<Map.Entry<String,String>> iterator;


    @Override
    public Map<String, String> read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {
        if (resultMap == null){
            HashOperations<String, String,String> ops = redisTemplate.opsForHash();
            resultMap = ops.entries(ACTIVE_USER_KEY);
            iterator = resultMap.entrySet().iterator();
        }
        if(iterator !=null && iterator.hasNext()){
            Map.Entry<String,String> entry = iterator.next();
            Map<String,String> map = new HashMap<>();
            map.put("userId", entry.getKey());
            map.put("entryTime",entry.getValue());
            return map;
        }
        return null;
    }
}
