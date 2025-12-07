package com.ecommerce.config;

import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        // Clear existing data
        productRepository.deleteAll();

        // Create sample products
        Product laptop = new Product();
        laptop.setName("Gaming Laptop");
        laptop.setDescription("High-performance laptop with RTX 4060 graphics card");
        laptop.setPrice(new BigDecimal("1299.99"));
        laptop.setQuantity(15);
        laptop.setCategory("Electronics");
        laptop.setImageUrl("/images/laptop.jpg");
        laptop.setActive(true);

        Product smartphone = new Product();
        smartphone.setName("Smartphone Pro");
        smartphone.setDescription("Latest smartphone with 5G connectivity");
        smartphone.setPrice(new BigDecimal("899.99"));
        smartphone.setQuantity(25);
        smartphone.setCategory("Electronics");
        smartphone.setImageUrl("/images/phone.jpg");
        smartphone.setActive(true);

        Product headphones = new Product();
        headphones.setName("Wireless Headphones");
        headphones.setDescription("Noise-cancelling wireless headphones");
        headphones.setPrice(new BigDecimal("249.99"));
        headphones.setQuantity(40);
        headphones.setCategory("Electronics");
        headphones.setImageUrl("/images/headphones.jpg");
        headphones.setActive(true);

        Product tshirt = new Product();
        tshirt.setName("Cotton T-Shirt");
        tshirt.setDescription("Comfortable 100% cotton t-shirt");
        tshirt.setPrice(new BigDecimal("29.99"));
        tshirt.setQuantity(100);
        tshirt.setCategory("Clothing");
        tshirt.setImageUrl("/images/tshirt.jpg");
        tshirt.setActive(true);

        Product jeans = new Product();
        jeans.setName("Denim Jeans");
        jeans.setDescription("Classic blue denim jeans");
        jeans.setPrice(new BigDecimal("59.99"));
        jeans.setQuantity(75);
        jeans.setCategory("Clothing");
        jeans.setImageUrl("/images/jeans.jpg");
        jeans.setActive(true);

        Product book1 = new Product();
        book1.setName("Java Programming Guide");
        book1.setDescription("Complete guide to Java programming");
        book1.setPrice(new BigDecimal("49.99"));
        book1.setQuantity(30);
        book1.setCategory("Books");
        book1.setImageUrl("/images/book1.jpg");
        book1.setActive(true);

        Product book2 = new Product();
        book2.setName("Web Development Handbook");
        book2.setDescription("Modern web development with JavaScript");
        book2.setPrice(new BigDecimal("44.99"));
        book2.setQuantity(35);
        book2.setCategory("Books");
        book2.setImageUrl("/images/book2.jpg");
        book2.setActive(true);

        Product coffeemaker = new Product();
        coffeemaker.setName("Coffee Maker");
        coffeemaker.setDescription("Automatic coffee maker with timer");
        coffeemaker.setPrice(new BigDecimal("89.99"));
        coffeemaker.setQuantity(20);
        coffeemaker.setCategory("Home");
        coffeemaker.setImageUrl("/images/coffeemaker.jpg");
        coffeemaker.setActive(true);

        Product blender = new Product();
        blender.setName("High-Speed Blender");
        blender.setDescription("Professional blender for smoothies");
        blender.setPrice(new BigDecimal("129.99"));
        blender.setQuantity(18);
        blender.setCategory("Home");
        blender.setImageUrl("/images/blender.jpg");
        blender.setActive(true);

        Product watch = new Product();
        watch.setName("Smart Watch");
        watch.setDescription("Fitness tracker with heart rate monitor");
        watch.setPrice(new BigDecimal("299.99"));
        watch.setQuantity(50);
        watch.setCategory("Electronics");
        watch.setImageUrl("/images/watch.jpg");
        watch.setActive(true);

        // Save all products
        productRepository.saveAll(Arrays.asList(
                laptop, smartphone, headphones, tshirt, jeans,
                book1, book2, coffeemaker, blender, watch));

        System.out.println("✅ Sample data loaded successfully! Total products: " + productRepository.count());
    }
}
