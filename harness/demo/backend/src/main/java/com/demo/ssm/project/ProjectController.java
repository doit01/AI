package com.demo.ssm.project;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ssm/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService service;

    @GetMapping
    public ResponseEntity<List<ProjectDto>> list() {
        return ResponseEntity.ok(service.list());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> create(@Valid @RequestBody ProjectDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<ProjectDto> sendEvent(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var event = ProjectEvent.valueOf(body.get("event"));
        return ResponseEntity.ok(service.sendEvent(id, event));
    }
}
