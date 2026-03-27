package com.example.helpsystems.service;

import com.example.helpsystems.entity.Resource;

import java.util.List;

public interface ResourceService {

    List<Resource> getResourcesByIssueType(String issueType);

    Resource addResource(Resource resource);
}
