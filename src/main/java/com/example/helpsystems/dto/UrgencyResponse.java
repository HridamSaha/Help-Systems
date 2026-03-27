package com.example.helpsystems.dto;

public class UrgencyResponse {
    private String urgency;
    private double confidence;

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }
}
