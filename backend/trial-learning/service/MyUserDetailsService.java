// package com.example.demo.service;

// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.core.userdetails.UsernameNotFoundException;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.provisioning.InMemoryUserDetailsManager;
// import org.springframework.stereotype.Service;

// import com.example.demo.entity.UserEntity;
// import com.example.demo.repository.UserRepository;

// import jakarta.annotation.PostConstruct;
// import lombok.RequiredArgsConstructor;

// @Service
// @RequiredArgsConstructor
// public class MyUserDetailsService implements UserDetailsService{

//      //temporary implementation
//      private final PasswordEncoder encoder;
//      private InMemoryUserDetailsManager manager;
//      private final UserRepository userRepository;
//      private final UserEntity userEntity;

     
//     // @PostConstruct // This runs right after Lombok finishes injecting the dependencies
//     // public void initUsers() {
//     //     UserDetails user1 = User.withUsername("sai")
//     //         .password(encoder.encode("sai123")) // Securely hashed via BCrypt
//     //         .roles("ADMIN")
//     //         .build();

//     //     UserDetails user2 = User.withUsername("student")
//     //         .password(encoder.encode("s123"))
//     //         .roles("USER")
//     //         .build();

//     //     this.manager = new InMemoryUserDetailsManager(user1, user2);
//     // }

//     //this came bcos the in-built UserDeatilsService(inetrface) having a method called loadUserByUserName..
//     @Override
//     public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

//     userRepository.findByUsername(username);
        
//         return manager.loadUserByUsername(username);
//     }

// }



   
//      //customizing UserDetailsService
//     //  @Bean
//     //  public UserDetailsService userDetailsService() {

//     //     UserDetails user1 = User

//     //     .
//     //     return new InMemoryUserDetailsManager() ;
//     //  }

//     //to make as authenticated object...
//     //by defaults this runs..
//     // authentication obj ----> auth provider ----> authencated obj

//     //our custom AuthenticationProvider
//     //very very important...................

//     //just temporary learning dhaan this below service..

//     //     @Bean
//     // public UserDetailsService userDetailsService(){

//     //     //withDefaultPasswordEncoder ----> depreacated
//     //     UserDetails user1 = User
//     //     .withDefaultPasswordEncoder()
//     //     .username("sai")
//     //     .password("sai123")
//     //     .roles("ADMIN")
//     //     .build();

//     //     //withDefaultPasswordEncoder ----> depreacated
//     //     UserDetails user2 = User
//     //     .withDefaultPasswordEncoder()   
//     //     .username("saiadmin")
//     //     .password("s123")
//     //     .roles("ADMIN")
//     //     .build();

//     //     // InMemoryUserDetailsManager - built-in storage implementation that stores users directly inside your computer's RAM memory instead of a database. 

//     //     return new InMemoryUserDetailsManager(user1,user2);
//     // }