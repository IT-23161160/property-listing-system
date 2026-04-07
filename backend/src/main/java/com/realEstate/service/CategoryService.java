package com.realEstate.service;

import com.realEstate.model.Category;
import com.realEstate.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(String id) {
        return categoryRepository.findById(id);
    }

    public Category addCategory(Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            throw new IllegalArgumentException("Category name is required");
        }

        if (categoryRepository.findByNameIgnoreCase(category.getName()).isPresent()) {
            throw new IllegalArgumentException("Category already exists");
        }

        return categoryRepository.save(category);
    }

    public Category updateCategory(Category category) {
        Category existing = categoryRepository.findById(category.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existing.setName(category.getName());
        return categoryRepository.save(existing);
    }

    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }
}
