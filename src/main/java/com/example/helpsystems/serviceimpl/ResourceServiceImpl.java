package com.example.helpsystems.serviceimpl;

import com.example.helpsystems.entity.Resource;
import com.example.helpsystems.repository.ResourceRepository;
import com.example.helpsystems.service.ResourceService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public List<Resource> getResourcesByIssueType(String issueType) {
        return resourceRepository.findByIssueType(issueType);
    }

    @Override
    public Resource addResource(Resource resource) {
        return resourceRepository.save(resource);
    }
}
