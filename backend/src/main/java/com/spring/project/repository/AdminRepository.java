package com.spring.project.repository;

import com.spring.project.dto.AdminDashboard;
import lombok.RequiredArgsConstructor;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminRepository {
    private final SqlSession session;

    public AdminDashboard getDashBoard(){
        return session.selectOne("adminDashboard");
    }
}
