package com.demo.ssm.batch;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record BatchDto(
    Long id,
    @NotBlank String name,
    @NotBlank String code,
    BatchState state,
    Long processId
) {
    static BatchDto from(Batch b) {
        return BatchDto.builder()
            .id(b.getId())
            .name(b.getName())
            .code(b.getCode())
            .state(b.getState())
            .processId(b.getProcessId())
            .build();
    }
}
