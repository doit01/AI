package com.demo.domain;

import com.demo.statemachine.OrderEvent;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "state_machine_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StateMachineHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String machineId;
    
    private Long orderId;
    
    @Enumerated(EnumType.STRING)
    private OrderState fromState;
    
    @Enumerated(EnumType.STRING)
    private OrderState toState;
    
    @Enumerated(EnumType.STRING)
    private OrderEvent event;
    
    private String action;
    
    private Boolean result;
    
    private String errorMessage;
    
    private LocalDateTime createTime;
    
    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }
}