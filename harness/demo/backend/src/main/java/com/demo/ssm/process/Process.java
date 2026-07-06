package com.demo.ssm.process;

import com.demo.common.BaseEntity;
import com.demo.ssm.project.Project;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@Table(name = "ssm_process")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Process extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    @Column(name = "project_id", insertable = false, updatable = false)
    private Long projectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;
}
