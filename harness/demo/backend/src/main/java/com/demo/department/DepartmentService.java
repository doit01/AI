package com.demo.department;

import com.demo.user.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository repo;

    @Transactional(readOnly = true)
    public List<DepartmentDto> getTree() {
        return repo.findByParentIsNullOrderBySortAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private DepartmentDto toDto(Department d) {
        List<DepartmentDto> children = d.getChildren() != null && !d.getChildren().isEmpty()
                ? d.getChildren().stream().map(this::toDto).collect(Collectors.toList())
                : null;
        List<UserDto> users = d.getUsers() != null && !d.getUsers().isEmpty()
                ? d.getUsers().stream().map(u -> UserDto.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .realName(u.getRealName())
                        .departmentName(d.getName())
                        .roleIds(u.getRoles() != null ? u.getRoles().stream().map(r -> r.getId()).collect(Collectors.toList()) : null)
                        .roleNames(u.getRoles() != null ? u.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()) : null)
                        .build())
                        .collect(Collectors.toList())
                : null;
        return DepartmentDto.builder()
                .id(d.getId())
                .name(d.getName())
                .sort(d.getSort())
                .parentId(d.getParent() != null ? d.getParent().getId() : null)
                .children(children)
                .users(users)
                .build();
    }

    @Transactional
    public DepartmentDto create(DepartmentDto dto) {
        Department d = new Department();
        d.setName(dto.name());
        d.setSort(dto.sort());
        if (dto.parentId() != null) {
            d.setParent(repo.findById(dto.parentId()).orElse(null));
        }
        return toDto(repo.save(d));
    }

    @Transactional
    public DepartmentDto update(Long id, DepartmentDto dto) {
        Department d = repo.findById(id).orElseThrow();
        d.setName(dto.name());
        d.setSort(dto.sort());
        if (dto.parentId() != null && !dto.parentId().equals(id)) {
            d.setParent(repo.findById(dto.parentId()).orElse(null));
        }
        return toDto(repo.save(d));
    }

    @Transactional
    public void delete(Long id) {
        Department d = repo.findById(id).orElseThrow();
        List<Long> allIds = new ArrayList<>();
        collectIds(d, allIds);
        repo.deleteAllById(allIds);
    }

    private void collectIds(Department d, List<Long> ids) {
        ids.add(d.getId());
        if (d.getChildren() != null) {
            for (Department c : d.getChildren()) {
                collectIds(c, ids);
            }
        }
    }
}
