package com.demo.ssm.batch;

import com.demo.ssm.event.StateChangedEvent;
import com.demo.ssm.process.ProcessRepository;
import com.demo.ssm.step.StepRepository;
import com.demo.ssm.step.StepState;
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
public class BatchService {
    private final BatchRepository repo;
    private final ProcessRepository processRepo;
    private final StepRepository stepRepo;
    private final StateMachineFactory<BatchState, BatchEvent> batchStateMachineFactory;
    @Qualifier("batchPersister")
    private final StateMachinePersister<BatchState, BatchEvent, String> persister;
    private final ApplicationEventPublisher eventPublisher;

    public List<BatchDto> list(Long processId) {
        return repo.findByProcessId(processId).stream().map(BatchDto::from).toList();
    }

    @Transactional
    public BatchDto create(BatchDto dto) {
        var b = new Batch();
        b.setName(dto.name());
        b.setCode(dto.code());
        b.setProcess(processRepo.findById(dto.processId()).orElseThrow());
        return BatchDto.from(repo.save(b));
    }

    @Transactional
    public BatchDto sendEvent(Long id, BatchEvent event) {
        var batch = repo.findById(id).orElseThrow();
        var fromState = batch.getState();
        var machineId = "batch_" + id;
        StateMachine<BatchState, BatchEvent> machine = batchStateMachineFactory.getStateMachine(machineId);
        try {
            persister.restore(machine, machineId);
        } catch (Exception ignored) {}
        machine.getExtendedState().getVariables().put("entityId", id);

        if (event == BatchEvent.COMPLETE_RELEASING) {
            var unfinished = stepRepo.countByBatchIdAndStateNot(id, StepState.SHORT);
            if (unfinished > 0) {
                throw new IllegalStateException("尚有操作步骤未执行");
            }
        }

        machine.sendEvent(event);
        var target = machine.getState().getId();
        batch.setState(target);
        repo.save(batch);
        try {
            persister.persist(machine, machineId);
        } catch (Exception ignored) {}
        eventPublisher.publishEvent(new StateChangedEvent("BATCH", id, fromState, target, event));
        return BatchDto.from(batch);
    }
}
