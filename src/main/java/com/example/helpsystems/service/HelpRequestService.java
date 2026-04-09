package com.example.helpsystems.service;

import com.example.helpsystems.dto.HelpRequestDTO;
import com.example.helpsystems.entity.HelpRequest;

import java.util.List;

public interface HelpRequestService {

    HelpRequest submitRequest(HelpRequestDTO dto);

    HelpRequest trackRequest(String requestId);

    HelpRequest updateStatus(String requestId, String status);

    List<HelpRequest> getAllRequests();

   // HelpRequest updateStatus(StatusUpdateDTO dto);
   HelpRequest reassign(String requestId, String authority);
    HelpRequest assignRequest(String requestId);
    HelpRequest resolveRequest(String requestId);
}
