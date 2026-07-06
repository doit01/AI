package com.demo.ssm.step;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record StepDto(
    Long id,
    @NotBlank String name,
    @NotBlank String code,
    StepState state,
    StepState resultType,
    Long batchId
) {
    static StepDto from(Step s) {
        return StepDto.builder()
            .id(s.getId())
            .name(s.getName())
            .code(s.getCode())
            .state(s.getState())
            .resultType(s.getResultType())
            .batchId(s.getBatchId())
            .build();
    }
}
