package com.demo.manytomany;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

// 4. 复合主键类 (EnrollmentId)
@Embeddable
public class EnrollmentId implements Serializable {
    private Long studentId;
    private Long courseId;
    // 必须实现 equals() 和 hashCode()
}