package com.demo.ssm.project;

import com.demo.ssm.batch.BatchRepository;
import com.demo.ssm.batch.BatchState;
import com.demo.ssm.event.StateChangedEvent;
import com.demo.ssm.process.ProcessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.persist.StateMachinePersister;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository repo;
    private final ProcessRepository processRepo;
    private final BatchRepository batchRepo;
    private final StateMachineFactory<ProjectState, ProjectEvent> projectStateMachineFactory;
    @Qualifier("projectPersister")
    private final StateMachinePersister<ProjectState, ProjectEvent, String> persister;
    private final ApplicationEventPublisher eventPublisher;

    public List<ProjectDto> list() {
        return repo.findAll().stream().map(ProjectDto::from).toList();
    }

    public ProjectDto get(Long id) {
        return ProjectDto.from(repo.findById(id).orElseThrow());
    }

    @Transactional
    public ProjectDto create(ProjectDto dto) {
        var p = new Project();
        p.setName(dto.name());
        p.setCode(dto.code());
        return ProjectDto.from(repo.save(p));
    }

    @Transactional
    public ProjectDto sendEvent(Long id, ProjectEvent event) {
        var project = repo.findById(id).orElseThrow();
        var fromState = project.getState();
        var machineId = "project_" + id;
        StateMachine<ProjectState, ProjectEvent> machine = projectStateMachineFactory.getStateMachine(machineId);
        try {
            persister.restore(machine, machineId);
        } catch (Exception ignored) {}
        machine.getExtendedState().getVariables().put("entityId", id);

        if (event == ProjectEvent.FINISH_PROJECT) {
            var processes = processRepo.findByProjectId(id);
            for (var proc : processes) {
                var unfinished = batchRepo.countByProcessIdAndStateNot(proc.getId(), BatchState.FINISH);
                if (unfinished > 0) {
                    throw new IllegalStateException("存在未完成的批次");
                }
            }
        }

        machine.sendEvent(event);
        var target = machine.getState().getId();
        project.setState(target);
        repo.save(project);
        try {
            persister.persist(machine, machineId);
        } catch (Exception ignored) {}
        eventPublisher.publishEvent(new StateChangedEvent("PROJECT", id, fromState, target, event));
        return ProjectDto.from(project);
    }
}
