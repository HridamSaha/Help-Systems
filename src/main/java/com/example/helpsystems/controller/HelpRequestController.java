package com.example.helpsystems.controller;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.helpsystems.dto.HelpRequestDTO;
import com.example.helpsystems.dto.StatusUpdateDTO;
import com.example.helpsystems.entity.HelpRequest;
import com.example.helpsystems.service.HelpRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/help")
//@RestController
//@RequestMapping("/api/help")
//@CrossOrigin(origins = "http://127.0.0.1:5500")

public class HelpRequestController {

    private final HelpRequestService helpRequestService;




    public HelpRequestController(HelpRequestService helpRequestService) {
        this.helpRequestService = helpRequestService;
    }

    // Submit anonymous help request
    @PostMapping("/submit")
    public ResponseEntity<HelpRequest> submitRequest(@RequestBody HelpRequestDTO dto) {

        HelpRequest savedRequest = helpRequestService.submitRequest(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedRequest);

    }


    // Track request by requestId
    @GetMapping("/track/{requestId}")
    public HelpRequest trackRequest(@PathVariable String requestId) {
        return helpRequestService.trackRequest(requestId);
    }

    @GetMapping("/all")
    public List<HelpRequest> getAllRequests() {
        return helpRequestService.getAllRequests();
    }
    @PutMapping("/status")
    public HelpRequest updateStatus(@RequestBody StatusUpdateDTO dto) {
        return helpRequestService.updateStatus(dto.getRequestId(), dto.getStatus());
    }

    @PutMapping("/reassign")
    public HelpRequest reassign(@RequestBody StatusUpdateDTO dto) {
        return helpRequestService.reassign(dto.getRequestId(), dto.getAuthority());
    }

}
