package com.demo.manytomany;

import jakarta.validation.constraints.NotBlank;

public record CourseDto(
    Long id,
    @NotBlank String name
) {}
