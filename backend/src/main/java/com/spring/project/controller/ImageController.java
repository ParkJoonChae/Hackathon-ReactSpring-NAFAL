package com.spring.project.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final String parentPath = "C:\\nafal_img";

    @GetMapping("/")
    public void getImage(@RequestParam("imagePath") String imagePath,HttpServletResponse response) {
        try {
            String decodedPath = java.net.URLDecoder.decode(imagePath, StandardCharsets.UTF_8.name());
            Path path = Paths.get(parentPath, decodedPath);
            System.out.println("Full image path: " + path);

            if (!Files.exists(path)) {
                System.out.println("Image file not found: " + path);
                response.sendError(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            String contentType = Files.probeContentType(path);
            if (contentType == null || !contentType.startsWith("image/")) {
                System.out.println("Invalid content type: " + contentType);
                response.sendError(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            response.setContentType(contentType);
            Files.copy(path, response.getOutputStream());
            response.getOutputStream().flush();
            System.out.println("Successfully streamed image: " + path);

        } catch (IOException e) {
            System.out.println("Error streaming image: " + imagePath);
            e.printStackTrace();
            try {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }
}