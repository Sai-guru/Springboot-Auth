// package com.example.demo.config;



// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.authentication.AuthenticationProvider;
// import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
// import org.springframework.security.config.Customizer;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;



// //this is a config file to spring

// @Configuration
// @EnableWebSecurity   //bypassing basic spring security , use this below implemented..

// public class SecurityConfig {

//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
//     // SecurityFilterChain gives the obj of the security chain

//     //disabling csrf bcos we do know abt that sessionID problem
//     //so lets make http stateless
// //   ------ http.csrf(customizer -> customizer.disable());

//     //now no security is there, so authorize for every http req
//     //now no one can access without crossing the authentication...
//     //even with in-built username and pass sent in postman still gets secured.demoApplication
//     //see this op in the pics folder inside image
// //  -------- http.authorizeHttpRequests(currReq->currReq.anyRequest().authenticated());

//     //get the form login for the browser
// //  -------- http.formLogin(Customizer.withDefaults());

//     //if wanna make that work from postamn/tools too then
// //  -------- http.httpBasic(Customizer.withDefaults());
//     //try the getAll with basic auth this time it works

//     //now 
//     //for every req must send the credentials
//     //in login from it will not work , but in postman it do works..
//     //every req successful , then new session is being created
// //  -------- http.sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

//     // simply

//     return http
//     .csrf(customizer -> customizer.disable())
//     .authorizeHttpRequests(currReq->currReq.anyRequest().authenticated())
//     .httpBasic(Customizer.withDefaults())
//     .sessionManagement(session->
//         session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//     .build();
    
//     // return http.build();

//     }

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }

//     //lets customize...
// //    AuthenticationProvider-  The processing engine interface. It takes the credentials sent by the user (from Postman) and compares them against the credentials stored in your system.
// // DaoAuthenticationProvider: A specific database-oriented implementation. It fetches user profiles from your UserDetailsService to verify credentials.
//     @Bean
//     public AuthenticationProvider authenticationProvider1(UserDetailsService customUserDetailsService,PasswordEncoder encoder) {

//         DaoAuthenticationProvider provider = new DaoAuthenticationProvider(customUserDetailsService);
//         provider.setPasswordEncoder(encoder);
//         return provider;

//     }

//     // How They All Talk To Each Other (The Workflow)
//     // You make an API call from Postman to your app.
//     // The SecurityFilterChain intercepts the request and reads the Basic Auth header.
//     // The chain hands the credentials over to the AuthenticationProvider.
//     // The provider looks into your UserDetailsService to see if a user named "sai" exists.
//     // If found, the provider checks if the password matches. 
//     // If true, it unlocks the door and lets your request reach your controller!




// }
