package com.demo.manytomany;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import java.util.List;

@Builder
public record StudentDto(
    Long id,
    @NotBlank String name,
    @Min(1) @Max(150) Integer age,
    List<Long> courseIds,
    List<String> courseNames
) {}
