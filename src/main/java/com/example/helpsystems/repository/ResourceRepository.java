package com.example.helpsystems.repository;

import com.example.helpsystems.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByIssueType(String issueType);

    List<Resource> findByIssueTypeAndArea(String issueType, String area);
}
