package com.demo.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import java.util.List;

@Builder
public record UserDto(
    Long id,
    @NotBlank String username,
    String realName,
    @Email String email,
    String phone,
    String password,
    Long departmentId,
    String departmentName,
    List<Long> roleIds,
    List<String> roleNames
) {}
