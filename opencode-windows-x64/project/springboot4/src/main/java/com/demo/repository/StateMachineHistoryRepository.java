package com.demo.repository;

import com.demo.domain.StateMachineHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StateMachineHistoryRepository extends JpaRepository<StateMachineHistory, Long> {
    List<StateMachineHistory> findByOrderIdOrderByCreateTimeAsc(Long orderId);
    List<StateMachineHistory> findByMachineIdOrderByCreateTimeAsc(String machineId);
}