package com.demo.repository;

import com.demo.domain.Order;
import com.demo.domain.OrderState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByState(OrderState state);
    List<Order> findByOrderNumber(String orderNumber);
}