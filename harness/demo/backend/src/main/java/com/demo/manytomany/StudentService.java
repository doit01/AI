package com.demo.manytomany;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepo;
    private final CourseRepository courseRepo;

    public List<StudentDto> findAll() {
        return studentRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public StudentDto create(StudentDto dto) {
        Student s = new Student();
        s.setName(dto.name());
        s.setAge(dto.age());
        if (dto.courseIds() != null) {
            s.setCourses(new LinkedHashSet<>(courseRepo.findAllById(dto.courseIds())));
        }
        return toDto(studentRepo.save(s));
    }

    @Transactional
    public StudentDto update(Long id, StudentDto dto) {
        Student s = studentRepo.findById(id).orElseThrow();
        s.setName(dto.name());
        s.setAge(dto.age());
        if (dto.courseIds() != null) {
            s.setCourses(new LinkedHashSet<>(courseRepo.findAllById(dto.courseIds())));
        }
        return toDto(studentRepo.save(s));
    }

    @Transactional
    public void delete(Long id) {
        studentRepo.deleteById(id);
    }

    private StudentDto toDto(Student s) {
        return StudentDto.builder()
                .id(s.getId())
                .name(s.getName())
                .age(s.getAge())
                .courseIds(s.getCourses() != null ? s.getCourses().stream().map(Course::getId).collect(Collectors.toList()) : null)
                .courseNames(s.getCourses() != null ? s.getCourses().stream().map(Course::getName).collect(Collectors.toList()) : null)
                .build();
    }
}
