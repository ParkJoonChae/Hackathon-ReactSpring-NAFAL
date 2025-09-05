package com.spring.project.config;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.DefaultBatchConfigurer;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.repository.support.JobRepositoryFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.PlatformTransactionManager;

import javax.inject.Qualifier;
import javax.sql.DataSource;
import java.util.Map;


@Configuration
@EnableRedisRepositories
@EnableBatchProcessing
public class RedisConfig extends DefaultBatchConfigurer {

    @Bean
    public LettuceConnectionFactory lettuceConnectionFactory(){ //redis 서버와 연결
        RedisStandaloneConfiguration configuration = new RedisStandaloneConfiguration();
        configuration.setHostName("redis-14762.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com");
        configuration.setPort(14762);
        configuration.setPassword("qS4hLiE0p5mf0wVJoafa9RK4E95mE5Uy");
        return new LettuceConnectionFactory(configuration);
    }
    @Bean
    public RedisTemplate<String,Object> redisTemplate(LettuceConnectionFactory lettuceConnectionFactory){//redis 데이터를 저장&조회
        RedisTemplate<String,Object> redisTemplate =new RedisTemplate<>();
        redisTemplate.setConnectionFactory(lettuceConnectionFactory);
        redisTemplate.setKeySerializer(new StringRedisSerializer()); //직렬화 하지 않아서 레디스 서버에서 문자열로 검색이 안됐음
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashValueSerializer(new StringRedisSerializer());

        redisTemplate.afterPropertiesSet();
        return redisTemplate;
    }

    @Bean
    public Job job(JobBuilderFactory jobBuilderFactory, Step syncStep){
        return jobBuilderFactory.get("syncUserUpdate")
                .start(syncStep)
                .build();
    }

    @Bean
    public Step syncActiveStep(StepBuilderFactory stepBuilderFactory,ActiveUserCountReader reader,ActiveUserCountWriter writer ){
            return stepBuilderFactory.get("syncGetUser")
                    .<Integer,Integer>chunk(1) //reader의 출력값,writer 입력값
                    .reader(reader)
                    .writer(writer)
                    .build();
    }

    @Bean
    public Step syncStep(StepBuilderFactory stepBuilderFactory,RedisReader reader,RedisDBWriter writer ){
        return stepBuilderFactory.get("syncUser")
                .<Map<String,String>, Map<String,String>>chunk(1) //reader의 출력값,writer 입력값
                .reader(reader)
                .writer(writer)
                .build();
    }


    @Override
    public void setDataSource(DataSource dataSource) {
        super.setDataSource(dataSource);
    }


}
