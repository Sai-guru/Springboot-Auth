package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.UserEntity;


public interface UserRepository extends JpaRepository<UserEntity,String> {

    //now we can use that in-built funcs...

}
