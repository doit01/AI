package com.demo.ssm.process;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProcessRepository extends JpaRepository<Process, Long> {
    List<Process> findByProjectId(Long projectId);
}
