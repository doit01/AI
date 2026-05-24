package com.demo.service;

import com.demo.domain.Order;
import com.demo.domain.StateMachineHistory;
import com.demo.repository.OrderRepository;
import com.demo.repository.StateMachineContextRepository;
import com.demo.repository.StateMachineHistoryRepository;
import com.demo.statemachine.OrderEvent;
import com.demo.domain.OrderState;
import com.demo.statemachine.OrderStateMachineInterceptor;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.statemachine.support.DefaultStateMachineContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderStateMachineService {

    private final StateMachineFactory<OrderState, OrderEvent> stateMachineFactory;
    private final OrderRepository orderRepository;
    private final StateMachineContextRepository contextRepository;
    private final StateMachineHistoryRepository historyRepository;
    private final OrderStateMachineInterceptor stateMachineInterceptor;
    private final ObjectMapper objectMapper;

    @Transactional
    public Order createOrder(String customerName, Double amount) {
        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customerName(customerName)
                .amount(amount)
                .state(OrderState.PENDING)
                .build();
        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public Map<String, Object> sendEvent(Long orderId, OrderEvent event, Map<String, Object> headers) {
        Order order = getOrder(orderId);
        StateMachine<OrderState, OrderEvent> sm = build(orderId, order.getState());
        
        Message<OrderEvent> messageBuilder = MessageBuilder.withPayload(event)
                .setHeader(OrderStateMachineInterceptor.ORDER_ID_HEADER, orderId)
                .setHeader("trigger_event", event)
                .build();
        
        if (headers != null) {
            headers.forEach((k, v) -> messageBuilder.getHeaders().set(k, v));
        }
        
        var result = sm.sendEvent(Mono.just(messageBuilder)).blockLast();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", result != null && result.getResultType() == org.springframework.statemachine.StateMachineResult.Order.ACCEPTED);
        response.put("orderId", orderId);
        response.put("previousState", order.getState());
        response.put("currentState", sm.getState().getId());
        response.put("event", event);
        response.put("rejected", result != null && result.getResultType() == org.springframework.statemachine.StateMachineResult.Order.REJECTED);
        
        if (result != null) {
            response.put("rejectedReason", result.getRejectionReason());
        }
        
        Map<String, Object> actionResult = sm.getStateMachineData();
        if (actionResult != null) {
            response.put("actionResult", actionResult.get("actionResult"));
        }
        
        log.info("Order {} event {}: {} -> {}", orderId, event, order.getState(), sm.getState().getId());
        
        return response;
    }

    private StateMachine<OrderState, OrderEvent> build(Long orderId, OrderState resumeState) {
        String machineId = stateMachineInterceptor.getMachineId(orderId);
        StateMachine<OrderState, OrderEvent> sm = stateMachineFactory.getStateMachine(machineId);
        
        sm.stopReactively().block();
        sm.getStateMachineData().put("orderId", orderId);
        sm.startReactively().block();
        
        if (resumeState != null) {
            sm.resetStateMachineReactively(
                new DefaultStateMachineContext<>(resumeState, null, null, null)
            ).block();
        }
        
        return sm;
    }

    public Map<String, Object> getStateMachineInfo(Long orderId) {
        Order order = getOrder(orderId);
        StateMachine<OrderState, OrderEvent> sm = build(orderId, order.getState());
        
        Map<String, Object> info = new HashMap<>();
        info.put("orderId", orderId);
        info.put("machineId", sm.getId());
        info.put("currentState", sm.getState().getId());
        info.put("availableEvents", sm.getTransitions()
                .filter(t -> t.getSource().getId().equals(sm.getState().getId()))
                .map(t -> {
                    Map<String, Object> transition = new HashMap<>();
                    transition.put("event", t.getTrigger().getEvent());
                    transition.put("target", t.getTarget().getId());
                    return transition;
                })
                .toList());
        
        return info;
    }

    public List<StateMachineHistory> getOrderHistory(Long orderId) {
        return stateMachineInterceptor.getHistory(orderId);
    }
}