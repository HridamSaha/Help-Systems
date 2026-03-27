package com.example.helpsystems.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String issueType;   // harassment/abuse etc.
    private String resourceName; // NGO Name / Police Station
    private String contactNumber;
    private String address;
    private String area;        // Geo-fence region
}
