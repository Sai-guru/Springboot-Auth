// package com.example.demo.entity;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.Table;
// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.Size;
// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;

// @Entity
// @Table(name = "users")
// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder(toBuilder = true)

// public class UserEntity {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @NotBlank(message = "Name is required")
//     @Size(min = 3,max = 50,message = "name must be between 3 and 50 characters")
//     @Column(unique = true,nullable = false,length = 50) 
//     private String username;
    
//     @NotBlank(message = "Password is required")
//     @Column(nullable = false) 
//     private String password;
    
    

// }
