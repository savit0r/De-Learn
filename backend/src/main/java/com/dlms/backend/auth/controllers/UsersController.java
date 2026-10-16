package com.dlms.backend.auth.controllers;

import java.util.List;
import java.util.Map;
import com.dlms.backend.auth.dto.LoginResponse;
import com.dlms.backend.auth.dto.UserResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dlms.backend.auth.dto.UsersDTO;
import com.dlms.backend.auth.services.UsersService;

@RestController
@RequestMapping("/api/auth")

public class UsersController {
	@Autowired
	UsersService usersService;

	@PostMapping("/login")
	public ResponseEntity<?> controllerAuthenticate(@RequestBody UsersDTO dto) {
		try {
			// Return JSON object { "token": "...", "role": "...", "userId": ... }
			LoginResponse response = usersService.authenticate(dto);
			return ResponseEntity.ok(response);
		} catch (RuntimeException e) {
			return ResponseEntity.status(401).body(Map.of("error", "Invalid Credentials"));
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", "Internal Server Error: " + e.getMessage()));
		}
	}

	@PostMapping("/register")
	public ResponseEntity<?> controllerRegisterUser(@RequestBody UsersDTO dto) {
		if (dto.getUserName() == null || dto.getUserName().trim().isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
		}
		if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
		}
		try {
			usersService.registerUser(dto);
			return ResponseEntity.ok(Map.of("message", "User registered successfully", "success", true));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "success", false));
		} catch (Exception e) {
			return ResponseEntity.status(500).body(Map.of("error", "Registration failed: " + e.getMessage(), "success", false));
		}
	}

	// Admin user management endpoints

	@GetMapping("/users")
	public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
		List<UserResponseDTO> users = usersService.getAllUsers();
		return ResponseEntity.ok(users);
	}

	@GetMapping("/users/{id}")
	public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
		try {
			UserResponseDTO user = usersService.getUserById(id);
			return ResponseEntity.ok(user);
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}

	@PostMapping("/users")
	public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
		try {
			UsersDTO dto = new UsersDTO();
			dto.setUserName(request.get("userName"));
			dto.setEmail(request.get("email"));
			dto.setPassword(request.get("password"));

			String role = request.get("role");
			if (role == null || role.isEmpty()) {
				role = "STUDENT"; // default
			}

			UserResponseDTO created = usersService.createUserWithRole(dto, role);
			return ResponseEntity.ok(created);
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	@PutMapping("/users/{id}/role")
	public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
		try {
			String newRole = request.get("role");
			UserResponseDTO updated = usersService.updateUserRole(id, newRole);
			return ResponseEntity.ok(updated);
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}

	@DeleteMapping("/users/{id}")
	public ResponseEntity<?> deleteUser(@PathVariable Long id) {
		boolean deleted = usersService.deleteUser(id);
		if (deleted) {
			return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
		}
		return ResponseEntity.notFound().build();
	}
}
