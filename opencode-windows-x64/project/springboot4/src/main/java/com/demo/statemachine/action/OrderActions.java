package com.demo.statemachine.action;

import com.demo.domain.Order;
import com.demo.repository.OrderRepository;
import com.demo.statemachine.OrderEvent;
import com.demo.domain.OrderState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.statemachine.action.Action;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderActions {

    private final OrderRepository orderRepository;

    public Action<OrderState, OrderEvent> confirmAction() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            log.info("[ACTION] Confirming order: {}", orderId);
            
            if (orderId != null) {
                Order order = orderRepository.findById(orderId).orElse(null);
                if (order != null) {
                    log.info("[ACTION] Order {} confirmed for customer: {}", orderId, order.getCustomerName());
                    context.getStateMachine().getStateMachineData().put("actionResult", "ORDER_CONFIRMED");
                }
            }
        };
    }

    public Action<OrderState, OrderEvent> paymentReceivedAction() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            Double amount = context.getMessageHeaders().get("payment_amount", Double.class);
            log.info("[ACTION] Processing payment for order: {}, amount: ${}", orderId, amount);
            
            context.getStateMachine().getStateMachineData().put("paymentProcessed", true);
            context.getStateMachine().getStateMachineData().put("actionResult", "PAYMENT_RECEIVED");
        };
    }

    public Action<OrderState, OrderEvent> processingStartedAction() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            log.info("[ACTION] Starting processing for order: {}", orderId);
            
            context.getStateMachine().getStateMachineData().put("processingStarted", true);
            context.getStateMachine().getStateMachineData().put("actionResult", "PROCESSING_STARTED");
        };
    }

    public Action<OrderState, OrderEvent> shippingAction() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            log.info("[ACTION] Shipping order: {}", orderId);
            
            context.getStateMachine().getStateMachineData().put("orderShipped", true);
            context.getStateMachine().getStateMachineData().put("actionResult", "ORDER_SHIPPED");
        };
    }

    public Action<OrderState, OrderEvent> deliveredAction() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            log.info("[ACTION] Order delivered: {}", orderId);
            
            context.getStateMachine().getStateMachineData().put("orderDelivered", true);
            context.getStateMachine().getStateMachineData().put("actionResult", "ORDER_DELIVERED");
        };
    }

    public Action<OrderState, OrderEvent> cancelledAction() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            String reason = context.getMessageHeaders().get("cancel_reason", String.class);
            log.info("[ACTION] Cancelling order: {}, reason: {}", orderId, reason);
            
            context.getStateMachine().getStateMachineData().put("orderCancelled", true);
            context.getStateMachine().getStateMachineData().put("cancelReason", reason);
            context.getStateMachine().getStateMachineData().put("actionResult", "ORDER_CANCELLED");
        };
    }

    public Action<OrderState, OrderEvent> refundAction() {
        return context -> {
            Long orderId = context.getMessageHeaders().get("order_id", Long.class);
            log.info("[ACTION] Processing refund for order: {}", orderId);
            
            context.getStateMachine().getStateMachineData().put("refundProcessed", true);
            context.getStateMachine().getStateMachineData().put("actionResult", "REFUND_PROCESSED");
        };
    }
}