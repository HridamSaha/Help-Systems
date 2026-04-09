package com.example.helpsystems.controller;

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
public class HelpRequestController {

    private final HelpRequestService helpRequestService;

    public HelpRequestController(HelpRequestService helpRequestService) {
        this.helpRequestService = helpRequestService;
    }

    // ✅ Submit request
    @PostMapping("/submit")
    public ResponseEntity<HelpRequest> submitRequest(@RequestBody HelpRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(helpRequestService.submitRequest(dto));
    }

    // ✅ Track request
    @GetMapping("/track/{requestId}")
    public HelpRequest trackRequest(@PathVariable String requestId) {
        return helpRequestService.trackRequest(requestId);
    }

    // ✅ Get all
    @GetMapping("/all")
    public List<HelpRequest> getAllRequests() {
        return helpRequestService.getAllRequests();
    }

    // ✅ Assign request (FIXED)
    @PutMapping("/assign/{requestId}")
    public HelpRequest assign(@PathVariable String requestId) {
        return helpRequestService.assignRequest(requestId);
    }

    // ✅ Resolve request (FIXED)
    @PutMapping("/resolve/{requestId}")
    public HelpRequest resolve(@PathVariable String requestId) {
        return helpRequestService.resolveRequest(requestId);
    }

    // ✅ Update status
    @PutMapping("/status")
    public HelpRequest updateStatus(@RequestBody StatusUpdateDTO dto) {
        return helpRequestService.updateStatus(dto.getRequestId(), dto.getStatus());
    }

    // ✅ Reassign
    @PutMapping("/reassign")
    public HelpRequest reassign(@RequestBody StatusUpdateDTO dto) {
        return helpRequestService.reassign(dto.getRequestId(), dto.getAuthority());
    }
    
}