# Spring Maven Framework application.properties 설정 가이드

## 기본 서버 설정
```properties
# 서버 포트 및 컨텍스트 패스
server.port=8080
server.servlet.context-path=/NAFAL

# 서버 주소 (선택사항)
server.address=0.0.0.0
```

## 데이터베이스 설정
```properties
# MySQL 데이터베이스 연결
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 설정
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

## CORS 설정
```properties
# CORS 허용 도메인
cors.allowed-origins=https://nafal.store,http://localhost:3000
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true
```

## 로깅 설정
```properties
# 로그 레벨
logging.level.root=INFO
logging.level.com.yourpackage=DEBUG
logging.level.org.springframework.web=DEBUG
```

## 파일 업로드 설정
```properties
# 파일 업로드 크기 제한
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## 세션 설정
```properties
# 세션 설정
server.servlet.session.timeout=30m
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=false
```

## 환경별 설정 분리

### application-dev.properties (개발환경)
```properties
# 개발환경 설정
spring.profiles.active=dev
spring.datasource.url=jdbc:mysql://localhost:3306/nafal_dev
logging.level.root=DEBUG
```

### application-prod.properties (운영환경)
```properties
# 운영환경 설정
spring.profiles.active=prod
spring.datasource.url=jdbc:mysql://your_prod_db_host:3306/nafal_prod
logging.level.root=WARN
server.servlet.session.cookie.secure=true
```

## 실행 시 프로파일 지정
```bash
# 개발환경
java -jar your-app.jar --spring.profiles.active=dev

# 운영환경
java -jar your-app.jar --spring.profiles.active=prod
```

## 주의사항
1. **데이터베이스 정보**: 실제 DB 정보로 변경
2. **도메인**: `nafal.store`를 실제 도메인으로 변경
3. **보안**: 운영환경에서는 민감한 정보를 환경변수로 관리
4. **포트**: 8080 포트가 사용 가능한지 확인

## 전체 설정 예시 (application.properties)
```properties
# 서버 설정
server.port=8080
server.servlet.context-path=/NAFAL
server.address=0.0.0.0

# 데이터베이스 설정
spring.datasource.url=jdbc:mysql://localhost:3306/nafal_db
spring.datasource.username=nafal_user
spring.datasource.password=nafal_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 설정
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# CORS 설정
cors.allowed-origins=https://nafal.store,http://localhost:3000
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true

# 로깅 설정
logging.level.root=INFO
logging.level.com.nafal=DEBUG

# 파일 업로드 설정
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# 세션 설정
server.servlet.session.timeout=30m
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=false
```
