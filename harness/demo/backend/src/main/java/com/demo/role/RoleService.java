package com.demo.role;

import com.demo.menu.Menu;
import com.demo.menu.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepo;
    private final MenuRepository menuRepo;

    public List<RoleDto> findAll() {
        return roleRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public RoleDto findById(Long id) {
        return toDto(roleRepo.findById(id).orElseThrow());
    }

    @Transactional
    public RoleDto create(RoleDto dto) {
        Role r = new Role();
        r.setName(dto.name());
        r.setCode(dto.code());
        r.setDescription(dto.description());
        if (dto.menuIds() != null) {
            r.setMenus(new LinkedHashSet<>(menuRepo.findAllById(dto.menuIds())));
        }
        return toDto(roleRepo.save(r));
    }

    @Transactional
    public RoleDto update(Long id, RoleDto dto) {
        Role r = roleRepo.findById(id).orElseThrow();
        r.setName(dto.name());
        r.setCode(dto.code());
        r.setDescription(dto.description());
        if (dto.menuIds() != null) {
            r.setMenus(new LinkedHashSet<>(menuRepo.findAllById(dto.menuIds())));
        }
        return toDto(roleRepo.save(r));
    }

    @Transactional
    public void delete(Long id) {
        roleRepo.deleteById(id);
    }

    private RoleDto toDto(Role r) {
        return RoleDto.builder()
                .id(r.getId())
                .name(r.getName())
                .code(r.getCode())
                .description(r.getDescription())
                .menuIds(r.getMenus() != null ? r.getMenus().stream().map(Menu::getId).collect(Collectors.toList()) : null)
                .build();
    }
}
