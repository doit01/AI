package com.demo.department;

import com.demo.user.UserDto;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import java.util.List;

@Builder
public record DepartmentDto(
    Long id,
    @NotBlank String name,
    Integer sort,
    Long parentId,
    List<DepartmentDto> children,
    List<UserDto> users
) {}
