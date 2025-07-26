package com.webel.ims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository repository;

    @PostMapping
    public ResponseEntity<Notification> send(@RequestBody Notification notification) {
        Notification saved = repository.save(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
