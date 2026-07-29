package com.example.demo.model;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

//this is DTO like ..
public class StudentModel {

    private int id;
    private String name;
    private int marks;


        // "Student" +" id= "+id+" marks"+ marks +" name "+name;
    

}
