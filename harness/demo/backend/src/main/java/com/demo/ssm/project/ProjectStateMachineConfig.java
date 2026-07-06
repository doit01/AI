package com.demo.ssm.project;

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
@EnableStateMachineFactory(name = "projectStateMachineFactory")
public class ProjectStateMachineConfig
        extends EnumStateMachineConfigurerAdapter<ProjectState, ProjectEvent> {

    private final StateMachineRuntimePersister<ProjectState, ProjectEvent, String> persister;

    public ProjectStateMachineConfig(
            @Qualifier("persister") StateMachineRuntimePersister<ProjectState, ProjectEvent, String> persister) {
        this.persister = persister;
    }

    @Override
    public void configure(StateMachineConfigurationConfigurer<ProjectState, ProjectEvent> config) throws Exception {
        config
            .withConfiguration()
                .autoStartup(true)
                .and()
            .withPersistence()
                .runtimePersister(persister);
    }

    @Override
    public void configure(StateMachineStateConfigurer<ProjectState, ProjectEvent> states) throws Exception {
        states
            .withStates()
                .initial(ProjectState.CREATE)
                .states(EnumSet.allOf(ProjectState.class));
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<ProjectState, ProjectEvent> transitions) throws Exception {
        transitions
            .withExternal()
                .source(ProjectState.CREATE).target(ProjectState.FINISH)
                .event(ProjectEvent.FINISH_PROJECT)
                .guard(allBatchesFinishedGuard())
                .action(updateProjectStateAction())
                .and()
            .withExternal()
                .source(ProjectState.CREATE).target(ProjectState.CANCEL)
                .event(ProjectEvent.CANCEL_PROJECT)
                .action(updateProjectStateAction());
    }

    @Bean
    public Guard<ProjectState, ProjectEvent> allBatchesFinishedGuard() {
        return ctx -> true;
    }

    @Bean
    public Action<ProjectState, ProjectEvent> updateProjectStateAction() {
        return ctx -> ctx.getStateMachine().getExtendedState().getVariables()
                .put("targetState", ctx.getTarget().getId());
    }
}
