package com.demo.repository;

import com.demo.domain.StateMachineContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StateMachineContextRepository extends JpaRepository<StateMachineContext, String> {
}