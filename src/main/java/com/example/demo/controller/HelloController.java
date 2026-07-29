package com.example.demo.controller;

import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class HelloController {


    // @GetMapping("/")
    // public String greet(){
    //     return "welcome buddy";
    // }
    
    @GetMapping("/")
    public String greet(HttpServletRequest req){
        return "welcome buddy "+" curr session Id : "+req.getSession().getId() ;
    }

}
