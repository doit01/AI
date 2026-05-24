package com.demo.controller;

import com.demo.domain.Order;
import com.demo.domain.StateMachineHistory;
import com.demo.service.OrderStateMachineService;
import com.demo.statemachine.OrderEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderStateMachineService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = orderService.createOrder(request.customerName(), request.amount());
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<Map<String, Object>> sendEvent(
            @PathVariable Long id, 
            @RequestBody SendEventRequest request) {
        Map<String, Object> headers = request.headers() != null ? request.headers() : new java.util.HashMap<>();
        Map<String, Object> response = orderService.sendEvent(id, request.event(), headers);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/info")
    public ResponseEntity<Map<String, Object>> getStateMachineInfo(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getStateMachineInfo(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<StateMachineHistory>> getOrderHistory(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderHistory(id));
    }

    public record CreateOrderRequest(String customerName, Double amount) {}
    public record SendEventRequest(OrderEvent event, Map<String, Object> headers) {}
}