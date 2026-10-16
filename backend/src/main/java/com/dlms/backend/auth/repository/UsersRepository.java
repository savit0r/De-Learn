package com.dlms.backend.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import com.dlms.backend.auth.entity.Users;

public interface UsersRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByUserName(String userName);

    Optional<Users> findByUserNameIgnoreCaseOrEmailIgnoreCase(String userName, String email);

    boolean existsByUserNameIgnoreCase(String userName);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUserName(String userName);
}
