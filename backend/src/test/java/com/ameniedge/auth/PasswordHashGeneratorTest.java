package com.ameniedge.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class PasswordHashGeneratorTest {

    @Test
    void testPasswordMatches() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        assertTrue(encoder.matches("Flood@12345", "$2a$10$3hrm.QAM4XXn0e9e9/yiUO3N2pLX6CXOS4/25gqLABW4azQ7iJr1a"));
        assertTrue(encoder.matches("Fire@12345", "$2a$10$USCfeTfTdNZT9gKa4Khy3OliX/G694wzy0W4AMPWlgTwHAW.S6uiO"));
        assertTrue(encoder.matches("Medical@12345", "$2a$10$9iHBpp6YRf.4RL8o8Pucv.N5axCFWc8MIiqtXCYL7PNHJUVGvjkz."));
        assertTrue(encoder.matches("Sar@12345", "$2a$10$Dc5yj1M1Lw6ELbRGtSfcwe.cPorvKCdGSuwxwuR7/sBTOcqLm6Bry"));
        assertTrue(encoder.matches("Leader@12345", "$2a$10$YkCcUD7Sbs1onEJXm429aunhYmSdGyqxnrXWsqxQQqtXPFKAMS57u"));
        assertTrue(encoder.matches("Super@12345", "$2a$10$z1wdOKlxg2jJrgwlKWi8Nu2TKKABUV.MbyXn1Vp9spqb2GTa3mUk."));
        assertTrue(encoder.matches("Admin@12345", "$2a$10$yBcHAA7d5EtdwhC/XzaWM.8XOIMlxt6tI1y1C9909agec8K2mQhTG"));
        assertTrue(encoder.matches("Citizen@12345", "$2a$10$F2iyiwFMv6USF5N0wSPY2u6diSVailii0V5IicUY7RQbBGx5mg8Eq"));
    }
}

