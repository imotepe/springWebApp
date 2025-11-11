package com.exampleproject.controller;

import com.exampleproject.model.Appointment;
import com.exampleproject.model.Customer;
import com.exampleproject.service.AppointmentService;
import com.exampleproject.service.CustomerService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService customerService;
    private final AppointmentService appointmentService;

    public CustomerController(
            CustomerService customerService,
            AppointmentService appointmentService
    ) {
        this.customerService = customerService;
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public List<Customer> all() {
        return customerService.findAll();
    }

    @GetMapping("/{id}")
    public Customer get(@PathVariable String id) {
        return customerService.findById(id);
    }

    @PostMapping
    public Customer create(@RequestBody Customer customer) {
        return customerService.create(customer);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable String id, @RequestBody Customer customer) {
        return customerService.update(id, customer);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        customerService.delete(id);
    }

    @GetMapping("/{id}/appointments")
    public List<Appointment> appointments(@PathVariable String id) {
        customerService.findById(id); // ensure 404 when missing
        return appointmentService.findByCustomerId(id);
    }
}
