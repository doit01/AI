package com.demo.ssm.batch;

import com.demo.common.BaseEntity;
import com.demo.ssm.process.Process;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@Table(name = "ssm_batch")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Batch extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    private BatchState state = BatchState.CREATE;

    @Column(name = "process_id", insertable = false, updatable = false)
    private Long processId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Process process;
}
