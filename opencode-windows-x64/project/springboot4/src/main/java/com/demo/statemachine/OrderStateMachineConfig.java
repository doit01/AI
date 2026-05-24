package com.demo.statemachine;

import com.demo.domain.OrderState;
import com.demo.statemachine.action.OrderActions;
import com.demo.statemachine.guard.OrderGuards;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineConfigurationConfigurer;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;
import org.springframework.statemachine.listener.StateMachineListener;
import org.springframework.statemachine.listener.StateMachineListenerAdapter;
import org.springframework.statemachine.state.State;

import java.util.EnumSet;

@Configuration
@EnableStateMachineFactory
@RequiredArgsConstructor
@Slf4j
public class OrderStateMachineConfig extends EnumStateMachineConfigurerAdapter<OrderState, OrderEvent> {

    private final OrderStateMachineInterceptor stateMachineInterceptor;
    private final OrderActions orderActions;
    private final OrderGuards orderGuards;

    @Override
    public void configure(StateMachineConfigurationConfigurer<OrderState, OrderEvent> config) throws Exception {
        config
            .withConfiguration()
            .autoStartup(false)
            .listener(listener())
            .interceptor(stateMachineInterceptor);
    }

    @Override
    public void configure(StateMachineStateConfigurer<OrderState, OrderEvent> states) throws Exception {
        states
            .withStates()
            .initial(OrderState.PENDING)
            .states(EnumSet.allOf(OrderState.class))
            .end(OrderState.DELIVERED)
            .end(OrderState.CANCELLED);
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<OrderState, OrderEvent> transitions) throws Exception {
        transitions
            // PENDING -> CONFIRMED: Confirm order
            .withExternal()
                .source(OrderState.PENDING)
                .target(OrderState.CONFIRMED)
                .event(OrderEvent.CONFIRM)
                .action(orderActions.confirmAction())
                .guard(orderGuards.inventoryAvailableGuard())
            .and()
            
            // CONFIRMED -> PAID: Process payment (with guard)
            .withExternal()
                .source(OrderState.CONFIRMED)
                .target(OrderState.PAID)
                .event(OrderEvent.PAY)
                .action(orderActions.paymentReceivedAction())
                .guard(orderGuards.paymentReceivedGuard())
            .and()
            
            // PAID -> PROCESSING: Start processing
            .withExternal()
                .source(OrderState.PAID)
                .target(OrderState.PROCESSING)
                .event(OrderEvent.PROCESS)
                .action(orderActions.processingStartedAction())
            .and()
            
            // PROCESSING -> SHIPPED: Ship order
            .withExternal()
                .source(OrderState.PROCESSING)
                .target(OrderState.SHIPPED)
                .event(OrderEvent.SHIP)
                .action(orderActions.shippingAction())
            .and()
            
            // SHIPPED -> DELIVERED: Mark delivered
            .withExternal()
                .source(OrderState.SHIPPED)
                .target(OrderState.DELIVERED)
                .event(OrderEvent.DELIVER)
                .action(orderActions.deliveredAction())
            .and()
            
            // PENDING -> CANCELLED: Cancel from pending (can cancel)
            .withExternal()
                .source(OrderState.PENDING)
                .target(OrderState.CANCELLED)
                .event(OrderEvent.CANCEL)
                .action(orderActions.cancelledAction())
            .and()
            
            // CONFIRMED -> CANCELLED: Cancel from confirmed
            .withExternal()
                .source(OrderState.CONFIRMED)
                .target(OrderState.CANCELLED)
                .event(OrderEvent.CANCEL)
                .action(orderActions.cancelledAction())
            .and()
            
            // PAID -> CANCELLED: Refund (requires payment guard)
            .withExternal()
                .source(OrderState.PAID)
                .target(OrderState.CANCELLED)
                .event(OrderEvent.REFUND)
                .action(orderActions.refundAction());
    }

    @Bean
    public StateMachineListener<OrderState, OrderEvent> listener() {
        return new StateMachineListenerAdapter<>() {
            @Override
            public void stateChanged(State<OrderState, OrderEvent> from, State<OrderState, OrderEvent> to) {
                if (from != null) {
                    log.info("State changed from {} to {}", from.getId(), to.getId());
                } else {
                    log.info("Initial state: {}", to.getId());
                }
            }

            @Override
            public void stateMachineError(org.springframework.statemachine.StateMachine<OrderState, OrderEvent> stateMachine, Exception exception) {
                log.error("State machine error", exception);
            }
        };
    }
}