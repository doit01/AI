package com.demo.statemachine;

import com.demo.domain.Order;
import com.demo.domain.OrderState;
import com.demo.repository.OrderRepository;
import com.demo.repository.StateMachineContextRepository;
import com.demo.repository.StateMachineHistoryRepository;
import com.demo.domain.StateMachineContext;
import com.demo.domain.StateMachineHistory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.state.State;
import org.springframework.statemachine.support.StateMachineInterceptorAdapter;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderStateMachineInterceptor extends StateMachineInterceptorAdapter<OrderState, OrderEvent> {

    public static final String ORDER_ID_HEADER = "order_id";
    
    private final OrderRepository orderRepository;
    private final StateMachineContextRepository contextRepository;
    private final StateMachineHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void preStateChange(State<OrderState, OrderEvent> state, org.springframework.statemachine.StateMachine<OrderState, OrderEvent> stateMachine,
                               org.springframework.statemachine.trigger.Trigger<OrderEvent, OrderEvent> trigger,
                               org.springframework.statemachine.state.StateMachineStateChangedContext<OrderState, OrderEvent> context) {
        
        Long orderId = (Long) stateMachine.getStateMachineData().getOrDefault("orderId", 
            context.getMessageHeaders().get(ORDER_ID_HEADER, Long.class));
        
        if (orderId == null) {
            log.warn("Order ID not found in state machine context or message headers");
            return;
        }

        OrderState fromState = null;
        String machineId = stateMachine.getId();
        
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
            
            fromState = order.getState();
            order.setState(state.getId());
            orderRepository.save(order);
            
            StateMachineContext smContext = contextRepository.findById(machineId)
                    .orElse(StateMachineContext.builder().machineId(machineId).orderId(orderId).build());
            smContext.setStateJson(objectMapper.writeValueAsString(stateMachine.getStateMachineData()));
            contextRepository.save(smContext);
            
            if (fromState != null && !fromState.equals(state.getId())) {
                OrderEvent event = context.getMessageHeaders().get("trigger_event", OrderEvent.class);
                if (event == null && trigger != null && trigger.getEvent() != null) {
                    event = trigger.getEvent().payload;
                }
                
                StateMachineHistory history = StateMachineHistory.builder()
                        .machineId(machineId)
                        .orderId(orderId)
                        .fromState(fromState)
                        .toState(state.getId())
                        .event(event)
                        .action(determineAction(event))
                        .result(true)
                        .build();
                historyRepository.save(history);
            }
            
            log.info("Persisted state change for order {}: {} -> {}", orderId, fromState, state.getId());
            
        } catch (Exception e) {
            log.error("Failed to persist state change for order {}", orderId, e);
            StateMachineHistory history = StateMachineHistory.builder()
                    .machineId(machineId)
                    .orderId(orderId)
                    .fromState(fromState)
                    .toState(state.getId())
                    .result(false)
                    .errorMessage(e.getMessage())
                    .build();
            historyRepository.save(history);
        }
    }

    private String determineAction(OrderEvent event) {
        if (event == null) return "UNKNOWN";
        return switch (event) {
            case CONFIRM -> "OrderConfirmedAction";
            case PAY -> "PaymentReceivedAction";
            case PROCESS -> "ProcessingStartedAction";
            case SHIP -> "OrderShippedAction";
            case DELIVER -> "OrderDeliveredAction";
            case CANCEL -> "OrderCancelledAction";
            case REFUND -> "RefundProcessedAction";
        };
    }

    public List<StateMachineHistory> getHistory(Long orderId) {
        return historyRepository.findByOrderIdOrderByCreateTimeAsc(orderId);
    }

    public String getMachineId(Long orderId) {
        return "order-sm-" + orderId;
    }
}