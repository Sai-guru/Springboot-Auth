// package com.example.demo.controller;

// import java.util.ArrayList;
// import java.util.List;

// import org.springframework.security.web.csrf.CsrfToken;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.example.demo.model.StudentModel;

// import jakarta.servlet.http.HttpServletRequest;

// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;

// @RestController()
// public class StudentController {


//     private List<StudentModel> arr = new ArrayList<>(List.of(
//         new StudentModel(1,"guru",100), new StudentModel(2,"kichu",199)
//     ));


//     @GetMapping("/students")
//     public List<StudentModel> getStuds() {
//         return arr;
//     }

//     @PostMapping("/newStudent")
//     public StudentModel postMethodName(@RequestBody StudentModel data) {
//          arr.add(data);
         
//          return data;

//     }
    
//     @GetMapping("/csrf-token")
//     public CsrfToken geCsrfToken(HttpServletRequest req){
//         return (CsrfToken)req.getAttribute("_csrf");
//     }
    

// }
