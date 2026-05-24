package com.demo.menu;

import com.demo.role.Role;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "sys_menu")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String path;
    private String component;
    private String icon;
    private Integer sort;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnoreProperties({"children", "parent", "roles"})
    private Menu parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sort ASC")
    @JsonIgnoreProperties({"parent", "roles"})
    private Set<Menu> children = new LinkedHashSet<>();

    @ManyToMany(mappedBy = "menus")
    @JsonIgnoreProperties({"menus", "users"})
    private Set<Role> roles = new LinkedHashSet<>();
}
