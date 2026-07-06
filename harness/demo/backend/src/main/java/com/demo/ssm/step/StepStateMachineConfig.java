package com.demo.ssm.step;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.action.Action;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import org.springframework.statemachine.persist.StateMachineRuntimePersister;

@Configuration
@EnableStateMachineFactory(name = "stepStateMachineFactory")
public class StepStateMachineConfig
        extends EnumStateMachineConfigurerAdapter<StepState, StepEvent> {

    private final StateMachineRuntimePersister<StepState, StepEvent, String> persister;

    public StepStateMachineConfig(
            @Qualifier("persister") StateMachineRuntimePersister<StepState, StepEvent, String> persister) {
        this.persister = persister;
    }

    @Override
    public void configure(StateMachineConfigurationConfigurer<StepState, StepEvent> config) throws Exception {
        config
            .withConfiguration()
                .autoStartup(true)
                .and()
            .withPersistence()
                .runtimePersister(persister);
    }

    @Override
    public void configure(StateMachineStateConfigurer<StepState, StepEvent> states) throws Exception {
        states
            .withStates()
                .initial(StepState.CREATE)
                .state(StepState.EXECUTED)
                .end(StepState.CANCEL)
                .and()
            .withStates()
                .parent(StepState.EXECUTED)
                .initial(StepState.SHORT)
                .state(StepState.SHORT)
                .state(StepState.EXCEED)
                .state(StepState.SKIP);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<StepState, StepEvent> transitions) throws Exception {
        transitions
            .withExternal()
                .source(StepState.CREATE).target(StepState.EXECUTED)
                .event(StepEvent.EXECUTE)
                .action(updateStepStateAction())
                .and()
            .withExternal()
                .source(StepState.SHORT).target(StepState.EXCEED)
                .event(StepEvent.MARK_EXCEED)
                .action(updateStepResultAction())
                .and()
            .withExternal()
                .source(StepState.SHORT).target(StepState.SKIP)
                .event(StepEvent.MARK_SKIP)
                .action(updateStepResultAction());
    }

    @Bean
    public Action<StepState, StepEvent> updateStepStateAction() {
        return ctx -> ctx.getStateMachine().getExtendedState().getVariables()
                .put("targetState", ctx.getTarget().getId());
    }

    @Bean
    public Action<StepState, StepEvent> updateStepResultAction() {
        return ctx -> {
            var variables = ctx.getStateMachine().getExtendedState().getVariables();
            variables.put("targetState", ctx.getTarget().getId());
            variables.put("resultType", ctx.getTarget().getId());
        };
    }
}
