package com.demo.ssm.event;

import com.demo.ssm.batch.BatchState;
import com.demo.ssm.step.Step;
import com.demo.ssm.step.StepRepository;
import com.demo.ssm.step.StepState;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class CascadeListener {

    private final StepRepository stepRepo;

    @EventListener
    @Transactional
    public void onBatchCancelled(StateChangedEvent e) {
        if (!"BATCH".equals(e.entityType())) return;
        if (e.toState() != BatchState.CANCEL) return;
        var steps = stepRepo.findByBatchId(e.entityId());
        for (Step step : steps) {
            step.setState(StepState.CANCEL);
        }
        stepRepo.saveAll(steps);
    }
}
