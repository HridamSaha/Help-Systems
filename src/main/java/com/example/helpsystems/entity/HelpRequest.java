package com.example.helpsystems.entity;
import com.example.helpsystems.enums.Department;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.example.helpsystems.enums.Department;
@Entity
@Table(name = "help_requests")
@Getter
@Setter
@NoArgsConstructor

public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String requestId;

    private String issueType;

    @Column(length = 1000)
    private String message;

    private String urgencyLevel;

    private String language;

    private String voiceText;

    private String locationArea;

    private String assignedAuthority;

    private String assignedOfficer;
    private String policeGroup;

    private String status;

    private LocalDateTime updatedAt;

    private Long responseTimeMinutes;

    private LocalDateTime createdAt;

  //  private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    @Enumerated(EnumType.STRING)
    private Department department;

    // Add this field
    // Add this field
   // private String urgency;
    private double latitude;
    private double longitude;

    private double policeLat;
    private double policeLng;


    // getter and setter

    //@Enumerated(EnumType.STRING)
   // private Department assignedDepartment;
}

