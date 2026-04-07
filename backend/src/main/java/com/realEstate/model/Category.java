package com.realEstate.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String categoryId;
    
    @Column(nullable = false, unique = true)
    private String name;

    public Category() {}

    public Category(String categoryId, String name) {
        this.categoryId = categoryId;
        this.name = name;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

