package com.example.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import com.example.auth.enums.UserRole;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Role")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Role {

    @EmbeddedId
    private Integer roleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_name", nullable = false, unique = true)
    private UserRole roleName;

    @Column(name = "description", length = 255)
    private String description;

    @OneToMany(mappedBy = "role")
    private Set<User> users = new HashSet<>();

    public String toString() {
        return "Role{" +
                "roleId=" + roleId +
                ", roleName=" + roleName +
                ", description='" + description + '\'' +
                '}';
    }
}


