package com.realEstate.service;

import com.realEstate.model.Category;
import com.realEstate.model.Property;
import com.realEstate.repository.PropertyRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PropertyService {
    private final PropertyRepository propertyRepository;

    @Value("${file.upload-dir:${user.home}/real-estate-uploads/properties}")
    private String uploadDir;

    @Autowired
    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Autowired
    private PropertyBSTService propertyBSTService;
    @Autowired
    private PropertySortingService propertySortingService;
    @Autowired
    private CategoryService categoryService;

    @PostConstruct
    public void initUploadDirectory() {
        File directory = new File(uploadDir);
        if (!directory.exists() && !directory.mkdirs()) {
            throw new RuntimeException("Failed to create upload directory: " + uploadDir);
        }
    }

    public Property addProperty(Property property, String sellerId, MultipartFile imageFile) throws IOException {
        if (property.getTitle() == null || property.getTitle().isEmpty()) {
            throw new IllegalArgumentException("Property title is required");
        }
        if (property.getPrice() <= 0) {
            throw new IllegalArgumentException("Property price must be positive");
        }
        if (property.getCategoryId() == null || property.getCategoryId().isEmpty()) {
            throw new IllegalArgumentException("Property category is required");
        }
        Optional<Category> category = categoryService.getCategoryById(property.getCategoryId());
        if (category.isEmpty()) {
            throw new IllegalArgumentException("Invalid category selected");
        }

        property.setSellerId(sellerId);
        property.setAvailable(true);

        Property savedProperty = propertyRepository.save(property);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imagePath = storeImage(imageFile, savedProperty.getPropertyId());
                savedProperty.setImagePath(imagePath);
                savedProperty = propertyRepository.save(savedProperty);
            } catch (IOException e) {
                propertyRepository.deleteById(savedProperty.getPropertyId());
                throw new IOException("Failed to save property image: " + e.getMessage(), e);
            }
        }

        propertyBSTService.insert(savedProperty);
        return savedProperty;
    }

    public List<Property> getAllProperties() {
        propertyBSTService.rebuildBST();
        return propertyBSTService.inOrderTraversal();
    }

    public Optional<Property> getPropertyById(String propertyId) {
        return propertyRepository.findById(propertyId);
    }

    public List<Property> getPropertiesBySeller(String sellerId) {
        return propertyRepository.findBySellerId(sellerId);
    }

    public List<Property> getPropertiesSortedByPrice() {
        propertyBSTService.rebuildBST();
        List<Property> properties = propertyBSTService.inOrderTraversal();
        return propertySortingService.quickSortByPrice(properties);
    }

    public Property updateProperty(String propertyId, Property updatedProperty, MultipartFile imageFile) throws IOException {
        Optional<Property> existingOpt = propertyRepository.findById(propertyId);
        if (existingOpt.isPresent()) {
            Property existing = existingOpt.get();

            if (imageFile != null && !imageFile.isEmpty()) {
                deleteImage(existing.getImagePath());
                String newImagePath = storeImage(imageFile, propertyId);
                existing.setImagePath(newImagePath);
            }

            existing.setTitle(updatedProperty.getTitle());
            existing.setDescription(updatedProperty.getDescription());
            existing.setPrice(updatedProperty.getPrice());
            existing.setLocation(updatedProperty.getLocation());
            existing.setAvailable(updatedProperty.isAvailable());
            existing.setCategoryId(updatedProperty.getCategoryId());

            Property updated = propertyRepository.save(existing);
            propertyBSTService.rebuildBST();

            return updated;
        }
        throw new IllegalArgumentException("Property not found with ID: " + propertyId);
    }

    public void deleteProperty(String propertyId) {
        Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
        if (propertyOpt.isPresent()) {
            Property property = propertyOpt.get();
            deleteImage(property.getImagePath());
            propertyBSTService.delete(property);
            propertyRepository.deleteById(propertyId);
        } else {
            throw new IllegalArgumentException("Property not found with ID: " + propertyId);
        }
    }

    public Property markPropertyAsSold(String propertyId) {
        Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
        if (propertyOpt.isPresent()) {
            Property property = propertyOpt.get();
            property.setAvailable(false);
            return propertyRepository.save(property);
        }
        throw new IllegalArgumentException("Property not found with ID: " + propertyId);
    }

    public List<Property> searchPropertiesByPriceRange(double minPrice, double maxPrice) {
        List<Property> allProperties = propertyBSTService.inOrderTraversal();
        List<Property> result = new ArrayList<>();

        for (Property property : allProperties) {
            if (property.getPrice() >= minPrice && property.getPrice() <= maxPrice) {
                result.add(property);
            }
        }

        return result;
    }

    private String storeImage(MultipartFile imageFile, String propertyId) throws IOException {
        if (imageFile.getOriginalFilename() == null || imageFile.getOriginalFilename().isBlank()) {
            throw new IllegalArgumentException("Invalid image file name");
        }

        String extension = "";
        int dotIndex = imageFile.getOriginalFilename().lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = imageFile.getOriginalFilename().substring(dotIndex);
        }

        String fileName = "property_" + propertyId + extension;
        Path destination = Paths.get(uploadDir, fileName);
        Files.copy(imageFile.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    private void deleteImage(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return;
        }

        Path image = Paths.get(uploadDir, imagePath);
        try {
            Files.deleteIfExists(image);
        } catch (IOException ignored) {
        }
    }
}