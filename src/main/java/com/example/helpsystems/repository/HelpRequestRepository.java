package com.example.helpsystems.repository;

import com.example.helpsystems.entity.HelpRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HelpRequestRepository extends JpaRepository<HelpRequest, Long> {
    Optional<HelpRequest> findByRequestId(String requestId);
}
