package com.demo.ssm.batch;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.action.Action;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import org.springframework.statemachine.guard.Guard;
import org.springframework.statemachine.persist.StateMachineRuntimePersister;

import java.util.EnumSet;

@Configuration
@EnableStateMachineFactory(name = "batchStateMachineFactory")
public class BatchStateMachineConfig
        extends EnumStateMachineConfigurerAdapter<BatchState, BatchEvent> {

    private final StateMachineRuntimePersister<BatchState, BatchEvent, String> persister;

    public BatchStateMachineConfig(
            @Qualifier("persister") StateMachineRuntimePersister<BatchState, BatchEvent, String> persister) {
        this.persister = persister;
    }

    @Override
    public void configure(StateMachineConfigurationConfigurer<BatchState, BatchEvent> config) throws Exception {
        config
            .withConfiguration()
                .autoStartup(true)
                .and()
            .withPersistence()
                .runtimePersister(persister);
    }

    @Override
    public void configure(StateMachineStateConfigurer<BatchState, BatchEvent> states) throws Exception {
        states
            .withStates()
                .initial(BatchState.CREATE)
                .states(EnumSet.allOf(BatchState.class));
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<BatchState, BatchEvent> transitions) throws Exception {
        transitions
            .withExternal()
                .source(BatchState.CREATE).target(BatchState.PRODUCTION)
                .event(BatchEvent.START_PRODUCTION)
                .action(updateBatchStateAction())
                .and()
            .withExternal()
                .source(BatchState.PRODUCTION).target(BatchState.RELEASING)
                .event(BatchEvent.START_RELEASING)
                .action(updateBatchStateAction())
                .and()
            .withExternal()
                .source(BatchState.RELEASING).target(BatchState.FINISH)
                .event(BatchEvent.COMPLETE_RELEASING)
                .guard(allStepsExecutedGuard())
                .action(updateBatchStateAction())
                .and()
            .withExternal()
                .source(BatchState.CREATE).target(BatchState.CANCEL)
                .event(BatchEvent.CANCEL_BATCH)
                .action(updateBatchStateAction())
                .and()
            .withExternal()
                .source(BatchState.PRODUCTION).target(BatchState.CANCEL)
                .event(BatchEvent.CANCEL_BATCH)
                .action(updateBatchStateAction())
                .and()
            .withExternal()
                .source(BatchState.RELEASING).target(BatchState.CANCEL)
                .event(BatchEvent.CANCEL_BATCH)
                .action(updateBatchStateAction());
    }

    @Bean
    public Guard<BatchState, BatchEvent> allStepsExecutedGuard() {
        return ctx -> true;
    }

    @Bean
    public Action<BatchState, BatchEvent> updateBatchStateAction() {
        return ctx -> ctx.getStateMachine().getExtendedState().getVariables()
                .put("targetState", ctx.getTarget().getId());
    }
}
