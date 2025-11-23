package com.nba.baskyapp;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Bean
	public CommandLineRunner connectionCheck(DataSource dataSource) {
		return args -> {
			System.out.println("========================================================");
			System.out.println("VERIFYING DATABASE CONNECTION...");
			System.out.println("========================================================");
			try (Connection conn = dataSource.getConnection()) {
				System.out.println("✅ CONNECTION SUCCESSFUL!");
				System.out.println("Catalog: " + conn.getCatalog());
				System.out.println("Metadata: " + conn.getMetaData().getDatabaseProductName());
			} catch (Exception e) {
				System.out.println("❌ CONNECTION FAILED");
				System.out.println("ERROR TYPE: " + e.getClass().getName());
				System.out.println("MESSAGE: " + e.getMessage());
				e.printStackTrace(); // This prints the FULL stack trace to logs
			}
			System.out.println("========================================================");
		};
	}
}
