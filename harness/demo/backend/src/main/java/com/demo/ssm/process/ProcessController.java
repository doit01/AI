package com.demo.ssm.process;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ssm/processes")
@RequiredArgsConstructor
public class ProcessController {
    private final ProcessService service;

    @PostMapping
    public ResponseEntity<ProcessDto> create(@Valid @RequestBody ProcessDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }
}
