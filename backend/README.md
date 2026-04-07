# Property Listing System

A comprehensive web-based property listing application built with Spring Boot that allows users to browse, add, and manage real estate properties with advanced data structure implementations.

## Project Overview

The Property Listing System is a full-featured web application that provides a platform for property management. It features user authentication with role-based access (Admin, Seller, Buyer), property categorization, image uploads, reviews, favorites, and advanced sorting capabilities. The system uses file-based storage and implements custom data structures for optimal performance.

## Tools and Frameworks Used

### Backend Framework
- **Spring Boot 3.x** - Main application framework
- **Spring MVC** - Web layer and REST controllers  
- **Spring Security** - Authentication and authorization
- **Thymeleaf** - Server-side template engine
- **Maven** - Build automation and dependency management

### Frontend Technologies
- **HTML5 & CSS3** - Markup and styling
- **Bootstrap 5** - Responsive UI framework
- **Bootstrap Icons** - Icon library
- **JavaScript** - Client-side interactivity

### Storage & File Handling
- **File-based Storage** - Custom repository implementation using text files
- **Multipart File Upload** - Image handling for properties
- **UUID Generation** - Unique identifier creation

### Development Tools
- **Java 17+** - Programming language
- **Jakarta EE** - Enterprise Java specifications

## Data Structures Used

### Custom Implementations
1. **Binary Search Tree (BST)**
   - **Purpose**: Efficient property storage and retrieval by price
   - **Implementation**: `PropertyBSTService` with `PropertyNode`
   - **Operations**: Insert, delete, in-order traversal
   - **Time Complexity**: O(log n) average for search operations

2. **QuickSort Algorithm**
   - **Purpose**: Sorting properties by price
   - **Implementation**: `PropertySortingService`
   - **Time Complexity**: O(n log n) average case

3. **ArrayList**
   - **Purpose**: Dynamic arrays for property collections
   - **Usage**: Storing lists of properties, categories, reviews
   - **Benefits**: Random access, dynamic resizing

4. **LinkedList** (Implicit)
   - **Purpose**: BST node connections
   - **Usage**: Left and right child pointers in `PropertyNode`

### File Storage Structure
```
data/
├── properties.txt          # Property data with pipe-delimited format
├── users.txt              # User authentication data
├── categories.txt         # Property categories
└── reviews.txt           # Property reviews

uploads/
└── properties/           # Property images storage
```

## Object-Oriented Programming (OOP) Concepts Used

### 1. Encapsulation
- **Private Fields**: All model classes use private attributes
- **Getter/Setter Methods**: Controlled access to object properties
- **Example**: `Property` class with private fields like `propertyId`, `title`, `price`

```java
public class Property {
    private String propertyId;
    private String title;
    private double price;
    // Getters and setters provide controlled access
}
```

### 2. Inheritance
- **Service Layer**: Common service patterns inherited across different services
- **Exception Handling**: Custom exception classes extending standard Java exceptions
- **Template Inheritance**: Thymeleaf template fragments for consistent UI

### 3. Polymorphism
- **Interface Implementation**: Multiple implementations of repository patterns
- **Method Overloading**: Different constructors and methods for various use cases
- **Runtime Polymorphism**: Service layer abstractions

### 4. Abstraction
- **Service Interfaces**: Abstract service contracts
- **Repository Pattern**: Data access abstraction
- **Controller Abstraction**: Request handling separation from business logic

### Design Patterns Implemented
- **Repository Pattern**: `PropertyRepository`, `UserRepository`
- **Service Layer Pattern**: `PropertyService`, `UserService`
- **MVC Pattern**: Controllers, Services, and Views separation
- **Dependency Injection**: Spring's IoC container

## Features

- **User Management**: Registration, login, role-based access control
- **Property Management**: CRUD operations with image uploads
- **Advanced Search**: BST-based property retrieval and sorting
- **Category System**: Property categorization and filtering
- **Review System**: User reviews and ratings for properties
- **Favorites**: Users can save favorite properties
- **Admin Panel**: Administrative property management
- **Responsive Design**: Mobile-friendly interface

## Setup Guide

### Prerequisites
- **Java 17 or higher**
- **Maven 3.6+**
- **IDE** (IntelliJ IDEA, Eclipse, or VS Code)
- **Web Browser**

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/IT-23161160/property-listing-system.git
   cd property-listing-system
   ```

2. **Project Structure Verification**
   ```
   property-listing-system/
   ├── src/
   │   ├── main/
   │   │   ├── java/com/realEstate/
   │   │   │   ├── controller/
   │   │   │   ├── service/
   │   │   │   ├── repository/
   │   │   │   ├── model/
   │   │   │   └── PropertyListingSystemApplication.java
   │   │   └── resources/
   │   │       ├── templates/
   │   │       ├── static/
   │   │       └── application.properties
   │   └── test/
   ├── data/                    # Auto-created directory for file storage
   ├── uploads/                 # Auto-created directory for images
   └── pom.xml
   ```

3. **Install Dependencies**
   ```bash
   mvn clean install
   ```

4. **Configuration**
   The application uses default file-based storage. Configuration in `application.properties`:
   ```properties
   # Server Configuration
   server.port=8080
   
   # File Upload Configuration
   spring.servlet.multipart.max-file-size=10MB
   spring.servlet.multipart.max-request-size=10MB
   file.upload-dir=uploads/properties
   
   # Logging
   logging.level.com.realEstate=DEBUG
   ```

5. **Run the Application**
   ```bash
   # Option 1: Using Maven
   mvn spring-boot:run
   
   # Option 2: Using JAR file
   mvn clean package
   java -jar target/property-listing-system-*.jar
   ```

6. **Access the Application**
   - Open your browser and navigate to: `http://localhost:8080`
   - The application will automatically create necessary directories and files

### Initial Setup
1. **Create Admin Account**: Register first user (will have admin privileges)
2. **Add Categories**: Use admin panel to create property categories
3. **Add Properties**: Start adding properties with images
4. **Test Features**: Test search, sort, and filter functionality

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, property management |
| **Seller** | Add/edit/delete own properties, view analytics |
| **Buyer** | Browse properties, add reviews, manage favorites |

## API Endpoints

### Property Management
- `GET /properties/all` - List all properties
- `GET /properties/sorted-by-price` - Properties sorted by price
- `POST /properties/add` - Add new property
- `PUT /properties/{id}` - Update property
- `DELETE /properties/{id}` - Delete property

### User Management  
- `GET /login` - Login page
- `POST /register` - User registration
- `GET /dashboard` - User dashboard

## Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=PropertyServiceTest

# Run with coverage
mvn test jacoco:report
```

## Performance Characteristics

| Operation | Data Structure | Time Complexity | Space Complexity |
|-----------|----------------|-----------------|------------------|
| Property Search by Price | BST | O(log n) | O(1) |
| Property Insertion | BST | O(log n) | O(1) |
| Sort by Price | QuickSort | O(n log n) | O(log n) |
| List All Properties | BST In-order | O(n) | O(n) |

## Security Features

- **Authentication**: Spring Security integration
- **Authorization**: Role-based access control
- **File Upload Security**: File type and size validation
- **Input Validation**: Form data sanitization
- **CSRF Protection**: Cross-site request forgery prevention

## Future Enhancements

- Database integration (MySQL/PostgreSQL)
- RESTful API development
- Advanced search filters
- Real-time notifications
- Payment integration
- Mobile application
- Map integration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

- **Developer**: IT-23161160
- **Repository**: [property-listing-system](https://github.com/IT-23161160/property-listing-system)

---
