package com.example.auth.service;

import com.example.auth.mapper.NotificationMapper;
import com.example.auth.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private NotificationMapper notificationMapper;
}
