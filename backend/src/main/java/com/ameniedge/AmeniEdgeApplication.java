package com.ameniedge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AmeniEdgeApplication {
    public static void main(String[] args) {
        SpringApplication.run(AmeniEdgeApplication.class, args);
    }
}
