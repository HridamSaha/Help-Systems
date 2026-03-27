package com.example.helpsystems.controller;

import com.example.helpsystems.entity.Resource;
import com.example.helpsystems.service.ResourceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin("*")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // Get resources by issueType
    @GetMapping("/{issueType}")
    public List<Resource> getResources(@PathVariable String issueType) {
        return resourceService.getResourcesByIssueType(issueType);
    }

    // Add new resource (admin)
    @PostMapping("/add")
    public Resource addResource(@RequestBody Resource resource) {
        return resourceService.addResource(resource);
    }
}
