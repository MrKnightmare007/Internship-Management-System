package com.webel.ims;

import com.webel.ims.service.RegistrationNumberService;
import com.webel.ims.service.AdmitCardPDFService;
import com.webel.ims.service.AdmitCardEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/api/exam")
public class ExamController {

    @Autowired
    private ExamDetailsRepository examDetailsRepository;

    @Autowired
    private ExamShiftRepository examShiftRepository;

    @Autowired
    private AcceptedStudentRepository acceptedStudentRepository;

    @Autowired
    private InternshipApplicationRepository applicationRepository;

    @Autowired
    private InternshipProgramRepository programRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private RegistrationNumberService registrationNumberService;

    @Autowired
    private AdmitCardPDFService admitCardPDFService;

    @Autowired
    private AdmitCardEmailService admitCardEmailService;

    @Autowired
    private SelectedStudentRepository selectedStudentRepository;

    // Setup examination details for a program
    @PostMapping("/setup")
    public ResponseEntity<?> setupExamination(@RequestBody ExamSetupRequest request) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            // Validate request
            if (!request.isValid()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid exam setup data provided.");
            }

            // Check if program belongs to this organization
            Optional<InternshipProgram> programOpt = programRepository.findById(request.getProgramId());
            if (programOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Program not found.");
            }

            InternshipProgram program = programOpt.get();
            if (!program.getIntOrgId().equals(user.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Program doesn't belong to your organization.");
            }

            // Check if exam is already setup for this program
            Optional<ExamDetails> existingExam = examDetailsRepository.findByProgramId(request.getProgramId());
            if (existingExam.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Examination is already setup for this program.");
            }

            // Check if total capacity matches or exceeds accepted students count
            long acceptedStudentsCount = acceptedStudentRepository.countByProgramId(request.getProgramId());
            int totalCapacity = request.getTotalCapacity();
            
            if (totalCapacity < acceptedStudentsCount) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    String.format("Total capacity (%d) is less than already accepted students (%d). Please increase capacity or adjust shifts.", 
                                totalCapacity, acceptedStudentsCount));
            }

            // Create exam details
            ExamDetails examDetails = new ExamDetails(
                request.getProgramId(),
                request.getExaminationLocation(),
                request.getExaminationCentreNo(),
                request.getExaminationDate(),
                request.getNumberOfShifts(),
                request.getOrganizerSignaturePath()
            );
            examDetails = examDetailsRepository.save(examDetails);

            // Create exam shifts
            List<ExamShift> examShifts = new ArrayList<>();
            for (ExamSetupRequest.ShiftDetails shiftDetail : request.getShifts()) {
                ExamShift shift = new ExamShift(
                    examDetails.getExamId(),
                    shiftDetail.getShiftName(),
                    shiftDetail.getStartTime(),
                    shiftDetail.getEndTime(),
                    shiftDetail.getMaxApplicants()
                );
                examShifts.add(shift);
            }
            examShiftRepository.saveAll(examShifts);

            // Auto-assign accepted students to shifts if any exist
            if (acceptedStudentsCount > 0) {
                assignStudentsToShifts(request.getProgramId(), examDetails.getExamId());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Examination setup completed successfully.");
            response.put("examId", examDetails.getExamId());
            response.put("totalCapacity", totalCapacity);
            response.put("acceptedStudents", acceptedStudentsCount);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error setting up examination: " + e.getMessage());
        }
    }

    // Get exam details for a program
    @GetMapping("/details/{programId}")
    public ResponseEntity<?> getExamDetails(@PathVariable Integer programId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            // Check if program belongs to this organization
            Optional<InternshipProgram> programOpt = programRepository.findById(programId);
            if (programOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Program not found.");
            }

            InternshipProgram program = programOpt.get();
            if (!program.getIntOrgId().equals(user.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Program doesn't belong to your organization.");
            }

            Optional<ExamDetails> examDetailsOpt = examDetailsRepository.findByProgramIdWithShifts(programId);
            if (examDetailsOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Examination not setup for this program.");
            }

            ExamDetails examDetails = examDetailsOpt.get();
            List<ExamShift> shifts = examShiftRepository.findByExamIdOrderByStartTime(examDetails.getExamId());

            Map<String, Object> response = new HashMap<>();
            response.put("examId", examDetails.getExamId());
            response.put("examinationLocation", examDetails.getExaminationLocation());
            response.put("examinationCentreNo", examDetails.getExaminationCentreNo());
            response.put("examinationDate", examDetails.getExaminationDate());
            response.put("numberOfShifts", examDetails.getNumberOfShifts());
            response.put("shifts", shifts.stream().map(shift -> {
                Map<String, Object> shiftData = new HashMap<>();
                shiftData.put("shiftId", shift.getShiftId());
                shiftData.put("shiftName", shift.getShiftName());
                shiftData.put("startTime", shift.getStartTime());
                shiftData.put("endTime", shift.getEndTime());
                shiftData.put("maxApplicants", shift.getMaxApplicants());
                shiftData.put("currentApplicants", shift.getCurrentApplicants());
                shiftData.put("availableCapacity", shift.getAvailableCapacity());
                return shiftData;
            }).collect(Collectors.toList()));
            response.put("totalCapacity", examDetails.getTotalCapacity());
            response.put("currentTotalStudents", examDetails.getCurrentTotalStudents());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching exam details: " + e.getMessage());
        }
    }

    // Get accepted students for a program
    @GetMapping("/accepted-students/{programId}")
    public ResponseEntity<?> getAcceptedStudents(@PathVariable Integer programId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            // Check if program belongs to this organization
            Optional<InternshipProgram> programOpt = programRepository.findById(programId);
            if (programOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Program not found.");
            }

            InternshipProgram program = programOpt.get();
            if (!program.getIntOrgId().equals(user.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Program doesn't belong to your organization.");
            }

            List<AcceptedStudent> acceptedStudents = acceptedStudentRepository.findByProgramIdWithApplicationDetails(programId);

            List<Map<String, Object>> studentData = acceptedStudents.stream().map(acceptedStudent -> {
                Map<String, Object> data = new HashMap<>();
                InternshipApplication app = acceptedStudent.getApplication();
                
                data.put("acceptedId", acceptedStudent.getAcceptedId());
                data.put("applicationId", acceptedStudent.getApplicationId());
                data.put("registrationNumber", acceptedStudent.getRegistrationNumber());
                data.put("studentName", app.getApplicantName());
                data.put("studentEmail", app.getApplicantEmail());
                data.put("studentPhone", app.getApplicantPhone());
                data.put("course", app.getCourseStream());
                data.put("semester", app.getCurrentSemester());
                data.put("acceptedAt", acceptedStudent.getAcceptedAt());
                data.put("admitCardGenerated", acceptedStudent.getAdmitCardGenerated());
                data.put("admitCardSent", acceptedStudent.getAdmitCardSent());
                
                // Add shift information if assigned
                if (acceptedStudent.getShiftId() != null) {
                    Optional<ExamShift> shiftOpt = examShiftRepository.findById(acceptedStudent.getShiftId());
                    if (shiftOpt.isPresent()) {
                        ExamShift shift = shiftOpt.get();
                        data.put("shiftName", shift.getShiftName());
                        data.put("examTime", shift.getTimeRange());
                    }
                }
                
                return data;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("acceptedStudents", studentData);
            response.put("totalCount", studentData.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching accepted students: " + e.getMessage());
        }
    }

    // Generate and send admit cards for a program
    @PostMapping("/generate-admit-cards/{programId}")
    public ResponseEntity<?> generateAndSendAdmitCards(@PathVariable Integer programId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            // Check if program belongs to this organization
            Optional<InternshipProgram> programOpt = programRepository.findById(programId);
            if (programOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Program not found.");
            }

            InternshipProgram program = programOpt.get();
            if (!program.getIntOrgId().equals(user.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Program doesn't belong to your organization.");
            }

            // Check if exam is setup
            Optional<ExamDetails> examDetailsOpt = examDetailsRepository.findByProgramId(programId);
            if (examDetailsOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Examination not setup for this program.");
            }

            ExamDetails examDetails = examDetailsOpt.get();
            
            // Get accepted students who haven't received admit cards yet
            List<AcceptedStudent> students = acceptedStudentRepository.findByProgramIdWithApplicationDetails(programId)
                    .stream()
                    .filter(student -> student.getShiftId() != null && !student.isAdmitCardSent())
                    .collect(Collectors.toList());

            if (students.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No students found who are eligible for admit cards.");
            }

            int successCount = 0;
            int failureCount = 0;
            List<String> errors = new ArrayList<>();

            for (AcceptedStudent student : students) {
                try {
                    // Get student's shift details
                    Optional<ExamShift> shiftOpt = examShiftRepository.findById(student.getShiftId());
                    if (shiftOpt.isEmpty()) {
                        errors.add("Shift not found for student: " + student.getApplication().getApplicantName());
                        failureCount++;
                        continue;
                    }

                    ExamShift examShift = shiftOpt.get();

                    // Generate PDF admit card
                    byte[] admitCardPdf = admitCardPDFService.generateAdmitCardPDF(student, examDetails, examShift);

                    // Send email with admit card
                    admitCardEmailService.sendAdmitCard(student, admitCardPdf);

                    // Update student record
                    student.markAdmitCardGenerated();
                    student.markAdmitCardSent();
                    acceptedStudentRepository.save(student);

                    successCount++;

                } catch (Exception e) {
                    failureCount++;
                    errors.add("Error for student " + student.getApplication().getApplicantName() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Admit card generation process completed.");
            response.put("totalStudents", students.size());
            response.put("successCount", successCount);
            response.put("failureCount", failureCount);
            
            if (!errors.isEmpty()) {
                response.put("errors", errors);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating admit cards: " + e.getMessage());
        }
    }

    // Helper method to generate unique registration number
    private String generateRegistrationNumber(Integer programId) {
        String year = String.valueOf(LocalDateTime.now().getYear()).substring(2); // Last 2 digits of year
        String programCode = "CS"; // Can be made dynamic based on program type
        String sequence = String.valueOf(System.currentTimeMillis()).substring(8); // Last 5 digits of timestamp
        
        String regNumber;
        int attempts = 0;
        do {
            regNumber = programCode + year + "S" + programId + sequence + String.format("%02d", attempts);
            attempts++;
        } while (acceptedStudentRepository.existsByRegistrationNumber(regNumber) && attempts < 100);
        
        return regNumber;
    }

    // Helper method to assign students to shifts automatically
    private void assignStudentsToShifts(Integer programId, Integer examId) {
        List<AcceptedStudent> unassignedStudents = acceptedStudentRepository.findByProgramId(programId)
                .stream()
                .filter(student -> student.getShiftId() == null)
                .collect(Collectors.toList());

        if (unassignedStudents.isEmpty()) {
            return;
        }

        List<ExamShift> availableShifts = examShiftRepository.findShiftsOrderedByAvailability(examId);
        
        for (AcceptedStudent student : unassignedStudents) {
            // Find first available shift
            ExamShift assignedShift = null;
            for (ExamShift shift : availableShifts) {
                if (shift.hasCapacity()) {
                    assignedShift = shift;
                    break;
                }
            }
            
            if (assignedShift != null) {
                student.setExamId(examId);
                student.setShiftId(assignedShift.getShiftId());
                student.setBarcodeData(student.getRegistrationNumber()); // Use registration number as barcode data
                acceptedStudentRepository.save(student);
            }
        }
    }

    // Final selection of students for internship after exam
    @PostMapping("/select-final-students/{programId}")
    public ResponseEntity<?> selectFinalStudents(@PathVariable Integer programId, @RequestBody Map<String, Object> request) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            // Check if program belongs to this organization
            Optional<InternshipProgram> programOpt = programRepository.findById(programId);
            if (programOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Program not found.");
            }

            InternshipProgram program = programOpt.get();
            if (!program.getIntOrgId().equals(user.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Program doesn't belong to your organization.");
            }

            @SuppressWarnings("unchecked")
            List<Integer> acceptedIds = (List<Integer>) request.get("acceptedIds");
            
            if (acceptedIds == null || acceptedIds.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No students selected for final selection.");
            }

            // Get accepted students
            List<AcceptedStudent> acceptedStudents = acceptedStudentRepository.findAllById(acceptedIds);
            
            if (acceptedStudents.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No valid accepted students found.");
            }

            // Verify all students belong to the specified program
            boolean allBelongToProgram = acceptedStudents.stream()
                .allMatch(student -> student.getProgramId().equals(programId));
            
            if (!allBelongToProgram) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Some students do not belong to the specified program.");
            }

            int selectedCount = 0;
            List<String> errors = new ArrayList<>();

            for (AcceptedStudent acceptedStudent : acceptedStudents) {
                try {
                    // Check if student is already selected
                    if (selectedStudentRepository.existsByAcceptedId(acceptedStudent.getAcceptedId())) {
                        errors.add("Student " + acceptedStudent.getRegistrationNumber() + " is already selected.");
                        continue;
                    }

                    // Create selected student record
                    SelectedStudent selectedStudent = new SelectedStudent(
                        acceptedStudent.getAcceptedId(),
                        acceptedStudent.getApplicationId(),
                        acceptedStudent.getProgramId(),
                        acceptedStudent.getRegistrationNumber(),
                        user.getUserId()
                    );
                    
                    // Set additional details if available
                    selectedStudent.setExamId(acceptedStudent.getExamId());
                    selectedStudent.setShiftId(acceptedStudent.getShiftId());
                    selectedStudent.setSelectionRemarks("Selected after examination process");
                    
                    selectedStudentRepository.save(selectedStudent);
                    selectedCount++;
                    
                } catch (Exception e) {
                    errors.add("Failed to select student " + acceptedStudent.getRegistrationNumber() + ": " + e.getMessage());
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Final selection process completed.");
            response.put("selectedCount", selectedCount);
            response.put("totalRequested", acceptedIds.size());
            
            if (!errors.isEmpty()) {
                response.put("errors", errors);
                response.put("errorCount", errors.size());
            }
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error selecting final students: " + e.getMessage());
        }
    }

    // Get selected students for a program
    @GetMapping("/selected-students/{programId}")
    public ResponseEntity<?> getSelectedStudents(@PathVariable Integer programId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            // Check if program belongs to this organization
            Optional<InternshipProgram> programOpt = programRepository.findById(programId);
            if (programOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Program not found.");
            }

            InternshipProgram program = programOpt.get();
            if (!program.getIntOrgId().equals(user.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Program doesn't belong to your organization.");
            }

            List<SelectedStudent> selectedStudents = selectedStudentRepository.findByProgramIdWithApplicationDetails(programId);

            List<Map<String, Object>> studentData = selectedStudents.stream().map(selectedStudent -> {
                Map<String, Object> data = new HashMap<>();
                InternshipApplication app = selectedStudent.getApplication();
                
                data.put("selectedId", selectedStudent.getSelectedId());
                data.put("acceptedId", selectedStudent.getAcceptedId());
                data.put("applicationId", selectedStudent.getApplicationId());
                data.put("registrationNumber", selectedStudent.getRegistrationNumber());
                data.put("studentName", app.getApplicantName());
                data.put("studentEmail", app.getApplicantEmail());
                data.put("studentPhone", app.getApplicantPhone());
                data.put("course", app.getCourseStream());
                data.put("semester", app.getCurrentSemester());
                data.put("finalScore", selectedStudent.getFinalScore());
                data.put("examMarks", selectedStudent.getExamMarks());
                data.put("selectionRemarks", selectedStudent.getSelectionRemarks());
                data.put("selectedAt", selectedStudent.getSelectedAt());
                data.put("status", selectedStudent.getStatus());
                data.put("internshipStartDate", selectedStudent.getInternshipStartDate());
                data.put("internshipEndDate", selectedStudent.getInternshipEndDate());
                
                return data;
            }).collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("selectedStudents", studentData);
            response.put("totalCount", studentData.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching selected students: " + e.getMessage());
        }
    }
}