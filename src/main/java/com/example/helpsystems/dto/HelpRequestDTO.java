package com.example.helpsystems.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HelpRequestDTO {

    private String issueType;
    private String message;
    private String language;
    private String voiceText;
    private String locationArea;
    private String urgency;


}
