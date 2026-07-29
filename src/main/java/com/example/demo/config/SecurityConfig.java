package com.example.demo.config;

import com.example.demo.DemoApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

//this is a config file to spring

@Configuration
@EnableWebSecurity   //bypassing basic spring security , use this below implemented..
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http){
    // SecurityFilterChain gives the obj of the security chain

    //disabling csrf bcos we do know abt that sessionID problem
    //so lets make http stateless
//   ------ http.csrf(customizer -> customizer.disable());

    //now no security is there, so authorize for every http req
    //now no one can access without crossing the authentication...
    //even with in-built username and pass sent in postman still gets secured.demoApplication
    //see this op in the pics folder inside image
//  -------- http.authorizeHttpRequests(currReq->currReq.anyRequest().authenticated());

    //get the form login for the browser
//  -------- http.formLogin(Customizer.withDefaults());

    //if wanna make that work from postamn/tools too then
//  -------- http.httpBasic(Customizer.withDefaults());
    //try the getAll with basic auth this time it works

    //now 
    //for every req must send the credentials
    //in login from it will not work , but in postman it do works..
    //every req successful , then new session is being created
//  -------- http.sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    // simply

    return http
    .csrf(customizer -> customizer.disable())
    .authorizeHttpRequests(currReq->currReq.anyRequest().authenticated())
    .httpBasic(Customizer.withDefaults())
    .sessionManagement(session->
        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .build();
    
    // return http.build();

    }

}
