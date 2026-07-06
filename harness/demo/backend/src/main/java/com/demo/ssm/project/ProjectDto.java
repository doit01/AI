package com.demo.ssm.project;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record ProjectDto(
    Long id,
    @NotBlank String name,
    @NotBlank String code,
    ProjectState state
) {
    static ProjectDto from(Project p) {
        return ProjectDto.builder()
            .id(p.getId())
            .name(p.getName())
            .code(p.getCode())
            .state(p.getState())
            .build();
    }
}
