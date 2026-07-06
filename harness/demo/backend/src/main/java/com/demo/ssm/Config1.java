package com.demo.ssm;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.StateContext;
import org.springframework.statemachine.config.EnableStateMachine;
import org.springframework.statemachine.config.StateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import org.springframework.statemachine.guard.Guard;

@Configuration
@EnableStateMachine
public class Config1
		extends StateMachineConfigurerAdapter<String, String> {

	@Override
	public void configure(StateMachineStateConfigurer<String, String> states)
			throws Exception {
		states
			.withStates()
				.initial("S1")
				.state("S2");
	}

	@Override
	public void configure(StateMachineTransitionConfigurer<String, String> transitions)
			throws Exception {
		transitions
			.withExternal()
				.source("S1").target("S2").event("E1").guard(guard1(true))
				.and()
			.withExternal()
				.source("S1").target("S2").event("E2").guard(guard1(false))
				.and()
			.withExternal()
				.source("S1").target("S2").event("E3").guard(guard2(true))
				.and()
			.withExternal()
				.source("S1").target("S2").event("E4").guard(guard2(false));
	}

	public Guard<String, String> guard1(final boolean value) {
		return new Guard<String, String>() {
			@Override
			public boolean evaluate(StateContext<String, String> context) {
				return value;
			}
		};
	}

	public Guard<String, String> guard2(final boolean value) {
		return new Guard<String, String>() {
			@Override
			public boolean evaluate(StateContext<String, String> context) {
				return value;
			}
		};
	}
}

