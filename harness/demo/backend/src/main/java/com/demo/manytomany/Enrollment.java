package com.demo.manytomany;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// 3. 中间实体 (Enrollment) - 代表选课记录
@Entity
public class Enrollment {
    // 复合主键：推荐使用 @EmbeddedId 或 @IdClass，以 @EmbeddedId 为例
    @EmbeddedId
    private EnrollmentId id;
    
    // 定义与 Student 的多对一关系，作为中间表的一部分
    @ManyToOne
    @MapsId("studentId") // 将主键中的 studentId 映射到此关联
    @JoinColumn(name = "student_id")
    private Student student;
    
    // 定义与 Course 的多对一关系
    @ManyToOne
    @MapsId("courseId") // 将主键中的 courseId 映射到此关联
    @JoinColumn(name = "course_id")
    private Course course;
    
    // 业务字段：最终的核心
    private Integer grade; // 成绩
    private LocalDateTime enrolledAt; // 选课时间
}