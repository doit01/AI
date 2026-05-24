package com.demo.user;

import com.demo.department.Department;
import com.demo.department.DepartmentRepository;
import com.demo.role.Role;
import com.demo.role.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final DepartmentRepository deptRepo;
    private final RoleRepository roleRepo;

    public List<UserDto> findAll() {
        return userRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<UserDto> findByDepartment(Long deptId) {
        return userRepo.findByDepartmentId(deptId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto findById(Long id) {
        return toDto(userRepo.findById(id).orElseThrow());
    }

    @Transactional
    public UserDto create(UserDto dto) {
        User u = new User();
        u.setUsername(dto.username());
        u.setPassword(dto.password() != null ? dto.password() : "123456");
        u.setRealName(dto.realName());
        u.setEmail(dto.email());
        u.setPhone(dto.phone());
        if (dto.departmentId() != null) {
            Department dept = deptRepo.findById(dto.departmentId()).orElse(null);
            u.setDepartment(dept);
            if (dept != null) dept.getUsers().add(u);
        }
        if (dto.roleIds() != null) {
            u.setRoles(new LinkedHashSet<>(roleRepo.findAllById(dto.roleIds())));
        }
        return toDto(userRepo.save(u));
    }

    @Transactional
    public UserDto update(Long id, UserDto dto) {
        User u = userRepo.findById(id).orElseThrow();
        u.setRealName(dto.realName());
        u.setEmail(dto.email());
        u.setPhone(dto.phone());
        if (dto.departmentId() != null) {
            u.setDepartment(deptRepo.findById(dto.departmentId()).orElse(null));
        }
        if (dto.roleIds() != null) {
            u.setRoles(new LinkedHashSet<>(roleRepo.findAllById(dto.roleIds())));
        }
        return toDto(userRepo.save(u));
    }

    @Transactional
    public void delete(Long id) {
        userRepo.deleteById(id);
    }

    private UserDto toDto(User u) {
        return UserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .realName(u.getRealName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .departmentId(u.getDepartment() != null ? u.getDepartment().getId() : null)
                .departmentName(u.getDepartment() != null ? u.getDepartment().getName() : null)
                .roleIds(u.getRoles() != null ? u.getRoles().stream().map(Role::getId).collect(Collectors.toList()) : null)
                .roleNames(u.getRoles() != null ? u.getRoles().stream().map(Role::getName).collect(Collectors.toList()) : null)
                .build();
    }
}
