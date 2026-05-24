package com.demo.statemachine.guard;

import com.demo.domain.Order;
import com.demo.repository.OrderRepository;
import com.demo.statemachine.OrderEvent;
import com.demo.domain.OrderState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.statemachine.guard.Guard;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderGuards {

    private final OrderRepository orderRepository;

    public Guard<OrderState, OrderEvent> paymentReceivedGuard() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            Double paymentAmount = context.getMessageHeaders().get("payment_amount", Double.class);
            
            if (orderId == null) {
                log.warn("[GUARD] Order ID not found, rejecting PAY");
                return false;
            }
            
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                log.warn("[GUARD] Order {} not found, rejecting PAY", orderId);
                return false;
            }
            
            if (paymentAmount == null) {
                paymentAmount = order.getAmount();
            }
            
            boolean sufficient = paymentAmount >= order.getAmount();
            log.info("[GUARD] Payment guard for order {}: amount=${}, required=${}, passed={}", 
                    orderId, paymentAmount, order.getAmount(), sufficient);
            
            return sufficient;
        };
    }

    public Guard<OrderState, OrderEvent> paymentTimeoutGuard() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            
            if (orderId == null) return true;
            
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) return true;
            
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime deadline = order.getCreateTime().plusSeconds(order.getPaymentTimeoutSeconds());
            boolean withinTimeout = now.isBefore(deadline);
            
            log.info("[GUARD] Timeout guard for order {}: deadline={}, withinTimeout={}", 
                    orderId, deadline, withinTimeout);
            
            if (!withinTimeout) {
                log.warn("[GUARD] Order {} payment timeout exceeded", orderId);
                context.getStateMachine().getStateMachineData().put("timeoutExceeded", true);
            }
            
            return withinTimeout;
        };
    }

    public Guard<OrderState, OrderEvent> inventoryAvailableGuard() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            Boolean inventoryChecked = (Boolean) context.getStateMachine()
                    .getStateMachineData().getOrDefault("inventoryChecked", false);
            
            if (inventoryChecked != null && inventoryChecked) {
                log.info("[GUARD] Inventory already checked for order {}", orderId);
                return true;
            }
            
            log.info("[GUARD] Inventory check passed for order {} (simulated)", orderId);
            context.getStateMachine().getStateMachineData().put("inventoryChecked", true);
            return true;
        };
    }

    public Guard<OrderState, OrderEvent> highValueOrderGuard() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            
            if (orderId == null) return true;
            
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) return true;
            
            boolean isHighValue = order.getAmount() > 10000;
            if (isHighValue) {
                log.info("[GUARD] High value order {} requires additional verification", orderId);
                context.getStateMachine().getStateMachineData().put("highValueVerified", true);
            }
            
            return true;
        };
    }

    public Guard<OrderState, OrderEvent> canCancelGuard() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            
            if (orderId == null) return true;
            
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) return true;
            
            boolean notShipped = order.getState() != OrderState.SHIPPED && 
                                 order.getState() != OrderState.DELIVERED;
            
            log.info("[GUARD] Can cancel order {}: state={}, canCancel={}", 
                    orderId, order.getState(), notShipped);
            
            return notShipped;
        };
    }
}