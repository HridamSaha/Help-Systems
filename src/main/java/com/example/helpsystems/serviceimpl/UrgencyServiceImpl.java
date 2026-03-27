package com.example.helpsystems.serviceimpl;

import com.example.helpsystems.dto.UrgencyResponse;
import com.example.helpsystems.service.UrgencyService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class UrgencyServiceImpl implements UrgencyService {

    @Value("${ml.api.url}")
    private String mlApiUrl;

    private final RestTemplate restTemplate;

    public UrgencyServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String detectUrgency(String message) {
        try {
            Map<String, String> body = Map.of("message", message);
            UrgencyResponse response = restTemplate.postForObject(
                    mlApiUrl, body, UrgencyResponse.class
            );
            if (response != null) {
                return response.getUrgency();
            }
        } catch (Exception e) {
            System.out.println("ML API error: " + e.getMessage());
        }
        return "Medium";
    }
}