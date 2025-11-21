package com.exampleproject.controller;

import com.exampleproject.model.Appointment;
import com.exampleproject.model.AppointmentEvent;
import com.exampleproject.service.AppointmentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public List<Appointment> all(
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to
    ) {
        return appointmentService.search(customerId, from, to);
    }

    @GetMapping("/{id}")
    public Appointment get(@PathVariable String id) {
        return appointmentService.findByIdForUser(id);
    }

    @PostMapping
    public Appointment create(@RequestBody Appointment appointment) {
        return appointmentService.create(appointment);
    }

    @PutMapping("/{id}")
    public Appointment update(@PathVariable String id, @RequestBody Appointment appointment) {
        return appointmentService.update(id, appointment);
    }

    @PostMapping("/{id}/events")
    public Appointment addEvent(
            @PathVariable String id,
            @RequestBody AppointmentEvent event
    ) {
        return appointmentService.addEvent(id, event);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        appointmentService.delete(id);
    }
}
