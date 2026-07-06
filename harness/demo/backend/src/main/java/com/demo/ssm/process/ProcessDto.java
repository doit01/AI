package com.demo.ssm.process;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record ProcessDto(
    Long id,
    @NotBlank String name,
    @NotBlank String code,
    Long projectId
) {
    static ProcessDto from(Process p) {
        return ProcessDto.builder()
            .id(p.getId())
            .name(p.getName())
            .code(p.getCode())
            .projectId(p.getProjectId())
            .build();
    }
}
