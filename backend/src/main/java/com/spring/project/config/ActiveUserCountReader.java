package com.spring.project.config;

import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.NonTransientResourceException;
import org.springframework.batch.item.ParseException;
import org.springframework.batch.item.UnexpectedInputException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ActiveUserCountReader implements ItemReader<Integer> {
    private final JdbcTemplate jdbcTemplate;
    private boolean read = false;

    public ActiveUserCountReader(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;  // Spring이 DataSource(HikariCP 등) 주입
    }

    @Override
    public Integer read() throws Exception {
        if (read) return null;
        read = true;

       /* String sql = "SELECT COUNT(DISTINCT userId) FROM users " +
                "WHERE recentAt = CURDATE() - INTERVAL 1 DAY";*/
        String sql = "SELECT COUNT(DISTINCT userId) FROM users " +
                "WHERE recentAt is not null";

        return jdbcTemplate.queryForObject(sql, Integer.class); // 커넥션 풀 사용
    }
}
