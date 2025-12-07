# E-Commerce Full-Stack Application

A modern full-stack e-commerce application built with Spring Boot and vanilla JavaScript.

## 🚀 Features

### Backend (Spring Boot)
- RESTful API architecture
- JPA/Hibernate for database operations
- H2 in-memory database
- Product management (CRUD operations)
- Order management system
- Shopping cart functionality
- Category-based filtering
- Product search functionality

### Frontend (HTML/CSS/JavaScript)
- Responsive design
- Product catalog with search and filters
- Shopping cart with quantity management
- Checkout process
- Order tracking
- Local storage for cart persistence

## 📋 Tech Stack

- **Backend:** Java 21, Spring Boot 3.2.0, Spring Data JPA
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Database:** H2 (in-memory)
- **Build Tool:** Maven
- **API:** RESTful

## 🛠️ Project Structure

```
ecommerce-app/
├── src/
│   ├── main/
│   │   ├── java/com/ecommerce/
│   │   │   ├── EcommerceApplication.java
│   │   │   ├── model/
│   │   │   │   ├── Product.java
│   │   │   │   ├── Order.java
│   │   │   │   └── OrderItem.java
│   │   │   ├── repository/
│   │   │   │   ├── ProductRepository.java
│   │   │   │   └── OrderRepository.java
│   │   │   ├── service/
│   │   │   │   ├── ProductService.java
│   │   │   │   └── OrderService.java
│   │   │   ├── controller/
│   │   │   │   ├── ProductController.java
│   │   │   │   └── OrderController.java
│   │   │   ├── dto/
│   │   │   │   └── OrderRequest.java
│   │   │   └── config/
│   │   │       └── DataLoader.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── index.html
│   │           ├── css/style.css
│   │           └── js/app.js
│   └── test/
└── pom.xml
```

## 🚦 Getting Started

### Prerequisites
- Java 21 or higher
- Maven 3.6 or higher

### Installation

1. **Build the project**
   ```bash
   mvn clean install
   ```

2. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

3. **Access the application**
   - Frontend: http://localhost:8080
   - H2 Console: http://localhost:8080/h2-console
     - JDBC URL: `jdbc:h2:mem:ecommercedb`
     - Username: `sa`
     - Password: (leave empty)

## 📡 API Endpoints

### Products
- `GET /api/products` - Get all active products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{category}` - Get products by category
- `GET /api/products/search?keyword={keyword}` - Search products
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/customer/{email}` - Get orders by customer email
- `POST /api/orders` - Create new order
- `PATCH /api/orders/{id}/status?status={status}` - Update order status

## 🎯 Features Implemented

### Product Management
- ✅ View all products
- ✅ Search products by name
- ✅ Filter by category
- ✅ Product details display
- ✅ Stock availability

### Shopping Cart
- ✅ Add products to cart
- ✅ Update quantities
- ✅ Remove items
- ✅ Cart persistence (localStorage)
- ✅ Real-time total calculation

### Checkout & Orders
- ✅ Customer information form
- ✅ Order summary
- ✅ Place order
- ✅ Order confirmation
- ✅ View order history

## 🎨 Sample Products

The application comes with 10 pre-loaded products across 4 categories:
- **Electronics:** Laptop, Smartphone, Headphones, Smart Watch
- **Clothing:** T-Shirt, Jeans
- **Books:** Java Guide, Web Development Handbook
- **Home:** Coffee Maker, Blender

## 🔒 Security Notes

This is a demo application. For production use, consider adding:
- Authentication & Authorization (Spring Security)
- HTTPS/SSL
- Input validation & sanitization
- CSRF protection
- Rate limiting
- Database encryption

## 📝 License

MIT License - feel free to use this project for learning and development.
