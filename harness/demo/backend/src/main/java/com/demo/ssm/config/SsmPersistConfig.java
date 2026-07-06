package com.demo.ssm.config;

import com.demo.ssm.batch.BatchEvent;
import com.demo.ssm.batch.BatchState;
import com.demo.ssm.project.ProjectEvent;
import com.demo.ssm.project.ProjectState;
import com.demo.ssm.step.StepEvent;
import com.demo.ssm.step.StepState;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.data.jpa.JpaPersistingStateMachineInterceptor;
import org.springframework.statemachine.data.jpa.JpaStateMachineRepository;
import org.springframework.statemachine.persist.DefaultStateMachinePersister;
import org.springframework.statemachine.persist.StateMachinePersister;
import org.springframework.statemachine.persist.StateMachineRuntimePersister;

@Configuration
public class SsmPersistConfig {

    @Bean
    public StateMachineRuntimePersister<?, ?, String> persister(JpaStateMachineRepository repo) {
        return new JpaPersistingStateMachineInterceptor<>(repo);
    }

    @Bean
    public StateMachinePersister<ProjectState, ProjectEvent, String> projectPersister(
            JpaStateMachineRepository repo) {
        var persist = new JpaPersistingStateMachineInterceptor<ProjectState, ProjectEvent, String>(repo);
        return new DefaultStateMachinePersister<>(persist);
    }

    @Bean
    public StateMachinePersister<BatchState, BatchEvent, String> batchPersister(
            JpaStateMachineRepository repo) {
        var persist = new JpaPersistingStateMachineInterceptor<BatchState, BatchEvent, String>(repo);
        return new DefaultStateMachinePersister<>(persist);
    }

    @Bean
    public StateMachinePersister<StepState, StepEvent, String> stepPersister(
            JpaStateMachineRepository repo) {
        var persist = new JpaPersistingStateMachineInterceptor<StepState, StepEvent, String>(repo);
        return new DefaultStateMachinePersister<>(persist);
    }
}
