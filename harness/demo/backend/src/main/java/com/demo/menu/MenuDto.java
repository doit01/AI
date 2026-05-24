package com.demo.menu;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import java.util.List;

@Builder
public record MenuDto(
    Long id,
    @NotBlank String name,
    String path,
    String component,
    String icon,
    Integer sort,
    Long parentId,
    List<MenuDto> children
) {}
