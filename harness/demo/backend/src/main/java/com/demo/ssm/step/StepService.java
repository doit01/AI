package com.demo.ssm.step;

import com.demo.ssm.batch.BatchRepository;
import com.demo.ssm.event.StateChangedEvent;
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
public class StepService {
    private final StepRepository repo;
    private final BatchRepository batchRepo;
    private final StateMachineFactory<StepState, StepEvent> stepStateMachineFactory;
    @Qualifier("stepPersister")
    private final StateMachinePersister<StepState, StepEvent, String> persister;
    private final ApplicationEventPublisher eventPublisher;

    public List<StepDto> list(Long batchId) {
        return repo.findByBatchId(batchId).stream().map(StepDto::from).toList();
    }

    @Transactional
    public StepDto create(StepDto dto) {
        var s = new Step();
        s.setName(dto.name());
        s.setCode(dto.code());
        s.setBatch(batchRepo.findById(dto.batchId()).orElseThrow());
        return StepDto.from(repo.save(s));
    }

    @Transactional
    public StepDto sendEvent(Long id, StepEvent event) {
        var step = repo.findById(id).orElseThrow();
        var fromState = step.getState();
        var machineId = "step_" + id;
        StateMachine<StepState, StepEvent> machine = stepStateMachineFactory.getStateMachine(machineId);
        try {
            persister.restore(machine, machineId);
        } catch (Exception ignored) {}
        machine.getExtendedState().getVariables().put("entityId", id);
        machine.sendEvent(event);
        var target = machine.getState().getId();

        step.setState(target == StepState.EXECUTED ? StepState.SHORT : target);
        if (event == StepEvent.MARK_EXCEED) step.setResultType(StepState.EXCEED);
        else if (event == StepEvent.MARK_SKIP) step.setResultType(StepState.SKIP);

        repo.save(step);
        try {
            persister.persist(machine, machineId);
        } catch (Exception ignored) {}
        eventPublisher.publishEvent(new StateChangedEvent("STEP", id, fromState, step.getState(), event));
        return StepDto.from(step);
    }
}
