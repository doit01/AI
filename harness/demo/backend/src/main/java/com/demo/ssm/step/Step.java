package com.demo.ssm.step;

import com.demo.common.BaseEntity;
import com.demo.ssm.batch.Batch;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@Table(name = "ssm_step")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Step extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    private StepState state = StepState.CREATE;

    @Enumerated(EnumType.STRING)
    private StepState resultType;

    @Column(name = "batch_id", insertable = false, updatable = false)
    private Long batchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Batch batch;
}
