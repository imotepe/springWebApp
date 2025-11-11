// ...existing code...
package com.exampleproject.repository;

import com.exampleproject.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> { }
// ...existing code...