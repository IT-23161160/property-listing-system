package com.realEstate.controller;

import com.realEstate.dto.CategoryRequest;
import com.realEstate.model.Category;
import com.realEstate.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<Category>> listCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable String id) {
        Category category = categoryService.getCategoryById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return ResponseEntity.ok(category);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Category> addCategory(@RequestBody CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        return ResponseEntity.ok(categoryService.addCategory(category));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Category> editCategory(@PathVariable String id, @RequestBody CategoryRequest request) {
        Category category = new Category();
        category.setCategoryId(id);
        category.setName(request.getName());
        return ResponseEntity.ok(categoryService.updateCategory(category));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}
