package com.demo.manytomany;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository repo;

    public List<CourseDto> findAll() {
        return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public CourseDto create(CourseDto dto) {
        Course c = new Course();
        c.setName(dto.name());
        return toDto(repo.save(c));
    }

    @Transactional
    public CourseDto update(Long id, CourseDto dto) {
        Course c = repo.findById(id).orElseThrow();
        c.setName(dto.name());
        return toDto(repo.save(c));
    }

    @Transactional
    public void delete(Long id) {
        repo.deleteById(id);
    }

    private CourseDto toDto(Course c) {
        return new CourseDto(c.getId(), c.getName());
    }
}
