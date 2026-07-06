package com.demo.ssm.process;

import com.demo.ssm.project.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcessService {
    private final ProcessRepository repo;
    private final ProjectRepository projectRepo;

    public List<ProcessDto> list(Long projectId) {
        return repo.findByProjectId(projectId).stream().map(ProcessDto::from).toList();
    }

    @Transactional
    public ProcessDto create(ProcessDto dto) {
        var p = new Process();
        p.setName(dto.name());
        p.setCode(dto.code());
        p.setProject(projectRepo.findById(dto.projectId()).orElseThrow());
        return ProcessDto.from(repo.save(p));
    }
}
