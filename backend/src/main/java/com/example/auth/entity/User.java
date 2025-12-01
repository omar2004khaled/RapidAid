package com.example.auth.entity;

import com.example.auth.enums.UserRole;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.auth.enums.UserStatus;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.lang.Contract;

@Entity
@Table(name = "User", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", length = 50, unique = true)
    private String username;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(name = "email", length = 150, unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", length = 512)
    @JsonIgnore
    private String password;

    @Column(name = "phone", length = 30)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private UserStatus status = UserStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", referencedColumnName = "role_id")
    private Role role;

    private boolean enabled = false;

    public UserRole getRoleName() {
        return role != null ? role.getRoleName() : null;
    }

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role.getRoleName() +
                ", status=" + status +
                ", enabled=" + enabled +
                '}';
    }
}