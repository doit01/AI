package com.demo.ssm.batch;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ssm/batches")
@RequiredArgsConstructor
public class BatchController {
    private final BatchService service;

    @PostMapping
    public ResponseEntity<BatchDto> create(@Valid @RequestBody BatchDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<BatchDto> sendEvent(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var event = BatchEvent.valueOf(body.get("event"));
        return ResponseEntity.ok(service.sendEvent(id, event));
    }
}
