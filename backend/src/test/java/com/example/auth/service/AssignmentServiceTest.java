package com.example.auth.service;

import com.example.auth.repository.AssignmentRepository;
import com.example.auth.repository.UserRepository;
import com.example.auth.repository.VehicleRepository;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private AssignmentService assignmentService;

//    @Test
//    void acceptAssignment_Success() {
//        User driver = new User();
//        driver.setUserId(1L);
//
//        Vehicle vehicle = new Vehicle();
//        vehicle.setDriver(driver);
//
//        Assignment assignment = new Assignment();
//        assignment.setVehicle(vehicle);
//
//        when(assignmentRepository.findById(1)).thenReturn(Optional.of(assignment));
//        when(userRepository.findById(1L)).thenReturn(Optional.of(driver));
//
//        assignmentService.acceptAssignment(1, 1L);
//
//        verify(assignmentRepository).save(any(Assignment.class));
//        verify(vehicleRepository).save(any(Vehicle.class));
//    }

//    @Test
//    void acceptAssignment_WrongDriver_ThrowsException() {
//        User driver = new User();
//        driver.setUserId(1L);
//
//        User wrongUser = new User();
//        wrongUser.setUserId(2L);
//
//        Vehicle vehicle = new Vehicle();
//        vehicle.setDriver(driver);
//
//        Assignment assignment = new Assignment();
//        assignment.setVehicle(vehicle);
//
//        when(assignmentRepository.findById(1)).thenReturn(Optional.of(assignment));
//        when(userRepository.findById(2L)).thenReturn(Optional.of(wrongUser));
//
//        assertThrows(RuntimeException.class, () ->
//            assignmentService.acceptAssignment(1, 2L));
//    }
}