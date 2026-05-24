package com.demo.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "state_machine_context")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StateMachineContext {
    
    @Id
    private String machineId;
    
    private Long orderId;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String stateJson;
    
    private LocalDateTime updateTime;
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}