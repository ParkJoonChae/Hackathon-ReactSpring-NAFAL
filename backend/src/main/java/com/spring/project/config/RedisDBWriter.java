package com.spring.project.config;

import com.spring.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
@Component
@RequiredArgsConstructor
public class RedisDBWriter implements ItemWriter<Map<String,String>> {
    private final UserRepository userRepository;

    //활성 유저 at 적용
    @Override
    public void write(List<? extends Map<String, String>> list) throws Exception {
            for (Map<String, String> map : list){
                userRepository.updateEntryUserAt(map);
            }

    }
}
