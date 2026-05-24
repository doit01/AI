package com.demo.role;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import java.util.List;

@Builder
public record RoleDto(
    Long id,
    @NotBlank String name,
    String code,
    String description,
    List<Long> menuIds
) {}
