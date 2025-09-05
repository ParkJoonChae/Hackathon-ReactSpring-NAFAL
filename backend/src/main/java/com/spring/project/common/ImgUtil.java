package com.spring.project.common;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.Folder;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import java.io.*;
import java.util.UUID;

@Component
public class ImgUtil {



    public String saveImg(MultipartFile multipart) {
        String parentPath = "C:\\nafal_img";
        String originalNm = multipart.getOriginalFilename();
        String savedNm = UUID.randomUUID()+originalNm;
        System.out.println("서버 저장 이름"+savedNm);
        File file = new File(parentPath,savedNm);
        if (!file.getParentFile().exists()){
            file.getParentFile().mkdir();
        }
        try(InputStream inputStream = multipart.getInputStream();
            OutputStream outputStream = new FileOutputStream(file)
            )
        {
            byte[] buffer = new byte[8192];
            int flag;
            while ((flag = inputStream.read(buffer))!= -1){
                outputStream.write(buffer,0,flag);
            }
            outputStream.flush();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return savedNm;
    }
}
