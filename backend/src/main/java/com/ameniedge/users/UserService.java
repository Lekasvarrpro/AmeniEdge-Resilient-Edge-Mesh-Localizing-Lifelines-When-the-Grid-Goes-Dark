package com.ameniedge.users;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public User save(User user) {
        if (user.getId() == null || user.getId().isBlank()) {
            user.setId("USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return userRepository.save(user);
    }

    public List<User> findByStation(String stationId) {
        return userRepository.findByStationId(stationId);
    }

    public List<User> findByRole(Role role) {
        return userRepository.findByRole(role);
    }
}
