package com.demo.role;

import com.demo.common.BaseEntity;
import com.demo.menu.Menu;
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
@Table(name = "sys_role")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Role extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(unique = true)
    private String code;

    private String description;

    @ManyToMany(mappedBy = "roles")
    @JsonIgnoreProperties({"roles", "department", "password"})
    private Set<User> users = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(name = "sys_role_menu",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "menu_id"))
    @JsonIgnoreProperties({"roles", "children", "parent"})
    private Set<Menu> menus = new LinkedHashSet<>();
}
