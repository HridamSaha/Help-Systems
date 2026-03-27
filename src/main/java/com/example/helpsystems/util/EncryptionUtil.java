package com.example.helpsystems.util;

import java.util.Base64;

public class EncryptionUtil {

    public static String encrypt(String text) {
        return Base64.getEncoder().encodeToString(text.getBytes());
    }

    public static String decrypt(String text) {
        return new String(Base64.getDecoder().decode(text));
    }
}
