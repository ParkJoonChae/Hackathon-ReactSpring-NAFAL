package com.spring.project;

import com.spring.project.config.AppPropertiesConfig;
import com.spring.project.config.RedisConfig;
import com.spring.project.config.RedisDBWriter;
import com.spring.project.config.RedisReader;
import com.spring.project.repository.UserRepository;
import com.spring.project.service.RedisService;

import org.junit.jupiter.api.Test;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.batch.test.JobLauncherTestUtils;
import org.springframework.batch.test.context.SpringBatchTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@SpringJUnitConfig(classes = {RedisConfig.class})
@SpringBatchTest
@Import({RedisConfig.class, RedisReader.class, RedisDBWriter.class, RedisService.class, AppPropertiesConfig.class})
@ContextConfiguration(locations = {
        "classpath:mapper/sql-map-config.xml",
        "file:src/main/webapp/WEB-INF/spring/root-context.xml"
})
public class RedisTest {

    @Autowired
    private RedisService redisService;
    @Autowired
    private JobLauncherTestUtils jobLauncherTestUtils; //job & step빈 이름을 기준으로 동작함



    @Test
    public void testRedisSetGet() {
        String key = "product:1001:title";
        String value = "친환경 텀블러";

        redisService.setValues(key,value);

        String result = redisService.getValues(key);

        assertEquals(value, result);
        System.out.println("result = " + result);
    }

    @Test
    public void saveActive() throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException, JobParametersInvalidException, JobRestartException {
        LocalDateTime time = LocalDateTime.now();
        redisService.saveActiveUser("1",time.toString());
        redisService.updateActiveUser();
    }
}
