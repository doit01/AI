package com.demo.ssm.batch;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByProcessId(Long processId);
    long countByProcessIdAndStateNot(Long processId, BatchState state);
}
