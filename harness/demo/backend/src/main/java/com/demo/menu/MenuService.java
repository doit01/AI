package com.demo.menu;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository repo;

    public List<MenuDto> getTree() {
        return repo.findByParentIsNullOrderBySortAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MenuDto> findAll() {
        return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    private MenuDto toDto(Menu m) {
        List<MenuDto> children = m.getChildren() != null && !m.getChildren().isEmpty()
                ? m.getChildren().stream().map(this::toDto).collect(Collectors.toList())
                : null;
        return MenuDto.builder()
                .id(m.getId())
                .name(m.getName())
                .path(m.getPath())
                .component(m.getComponent())
                .icon(m.getIcon())
                .sort(m.getSort())
                .parentId(m.getParent() != null ? m.getParent().getId() : null)
                .children(children)
                .build();
    }

    @Transactional
    public MenuDto create(MenuDto dto) {
        Menu m = new Menu();
        m.setName(dto.name());
        m.setPath(dto.path());
        m.setComponent(dto.component());
        m.setIcon(dto.icon());
        m.setSort(dto.sort());
        if (dto.parentId() != null) {
            m.setParent(repo.findById(dto.parentId()).orElse(null));
        }
        return toDto(repo.save(m));
    }

    @Transactional
    public MenuDto update(Long id, MenuDto dto) {
        Menu m = repo.findById(id).orElseThrow();
        m.setName(dto.name());
        m.setPath(dto.path());
        m.setComponent(dto.component());
        m.setIcon(dto.icon());
        m.setSort(dto.sort());
        if (dto.parentId() != null && !dto.parentId().equals(id)) {
            m.setParent(repo.findById(dto.parentId()).orElse(null));
        }
        return toDto(repo.save(m));
    }

    @Transactional
    public void delete(Long id) {
        Menu m = repo.findById(id).orElseThrow();
        if (m.getChildren() != null) {
            repo.deleteAll(m.getChildren());
        }
        repo.delete(m);
    }
}
