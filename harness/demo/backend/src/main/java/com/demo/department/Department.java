package com.demo.department;

import com.demo.common.BaseEntity;
import com.demo.user.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "sys_department")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Department extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private Integer sort;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnoreProperties({"children", "parent", "users"})
    private Department parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sort ASC")
    @JsonIgnoreProperties({"parent", "users"})
    private Set<Department> children = new LinkedHashSet<>();

    @OneToMany(mappedBy = "department")
    @JsonIgnoreProperties({"department", "roles"})
    private Set<User> users = new LinkedHashSet<>();
}
