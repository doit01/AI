package com.demo.ssm.step;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ssm/steps")
@RequiredArgsConstructor
public class StepController {
    private final StepService service;

    @PostMapping
    public ResponseEntity<StepDto> create(@Valid @RequestBody StepDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<StepDto> sendEvent(@PathVariable Long id, @RequestBody Map<String, String> body) {
        var event = StepEvent.valueOf(body.get("event"));
        return ResponseEntity.ok(service.sendEvent(id, event));
    }
}
