package com.webel.ims.service;

import com.webel.ims.AcceptedStudent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
public class AdmitCardEmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendAdmitCard(AcceptedStudent acceptedStudent, byte[] admitCardPdf) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        helper.setTo(acceptedStudent.getApplication().getApplicantEmail());
        helper.setSubject("Admit Card - " + acceptedStudent.getExamDetails().getProgram().getIntProgName());
        
        String emailBody = createEmailBody(acceptedStudent);
        helper.setText(emailBody, true);
        
        // Attach admit card PDF
        String fileName = "AdmitCard_" + acceptedStudent.getRegistrationNumber() + ".pdf";
        helper.addAttachment(fileName, new ByteArrayResource(admitCardPdf));
        
        mailSender.send(message);
    }
    
    private String createEmailBody(AcceptedStudent acceptedStudent) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        String studentName = acceptedStudent.getApplication().getApplicantName();
        String programName = acceptedStudent.getExamDetails().getProgram().getIntProgName();
        String registrationNumber = acceptedStudent.getRegistrationNumber();
        String examDate = acceptedStudent.getExamDetails().getExaminationDate().format(dateFormatter);
        String examLocation = acceptedStudent.getExamDetails().getExaminationLocation();
        String centreNumber = acceptedStudent.getExamDetails().getExaminationCentreNo();
        String shiftName = acceptedStudent.getExamShift().getShiftName();
        String startTime = acceptedStudent.getExamShift().getStartTime().format(timeFormatter);
        String endTime = acceptedStudent.getExamShift().getEndTime().format(timeFormatter);
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(".header { background: #2c5aa0; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }");
        html.append(".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }");
        html.append(".highlight { background: #e8f4f8; padding: 15px; border-left: 4px solid #2c5aa0; margin: 20px 0; }");
        html.append(".important { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }");
        html.append(".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }");
        html.append("</style></head><body>");
        
        html.append("<div class='header'><h2>Internship Examination - Admit Card</h2></div>");
        html.append("<div class='content'>");
        html.append("<p>Dear <strong>").append(studentName).append("</strong>,</p>");
        html.append("<p>Congratulations! You have been accepted for the internship examination.</p>");
        
        html.append("<div class='highlight'>");
        html.append("<h3>Examination Details:</h3>");
        html.append("<p><strong>Internship Program:</strong> ").append(programName).append("</p>");
        html.append("<p><strong>Registration Number:</strong> ").append(registrationNumber).append("</p>");
        html.append("<p><strong>Exam Date:</strong> ").append(examDate).append("</p>");
        html.append("<p><strong>Location:</strong> ").append(examLocation).append("</p>");
        html.append("<p><strong>Centre Number:</strong> ").append(centreNumber).append("</p>");
        html.append("<p><strong>Your Shift:</strong> ").append(shiftName).append("</p>");
        html.append("<p><strong>Timing:</strong> ").append(startTime).append(" - ").append(endTime).append("</p>");
        html.append("</div>");
        
        html.append("<div class='important'>");
        html.append("<h4>Important Instructions:</h4><ul>");
        html.append("<li><strong>Bring the attached admit card (PDF)</strong> along with a valid photo ID proof</li>");
        html.append("<li>Report to the examination center <strong>30 minutes before</strong> your scheduled exam time</li>");
        html.append("<li>Mobile phones and electronic devices are <strong>strictly prohibited</strong> in the examination hall</li>");
        html.append("<li>Carry your own <strong>pen and pencil</strong></li>");
        html.append("<li><strong>Late arrivals</strong> will not be permitted to enter the examination hall</li>");
        html.append("</ul></div>");
        
        html.append("<p>Please download and print the attached admit card. You must bring the printed admit card to the examination center.</p>");
        html.append("<p>Best of luck for your examination!</p>");
        html.append("<p>Regards,<br><strong>Internship Management Team</strong></p>");
        html.append("</div>");
        
        html.append("<div class='footer'>");
        html.append("<p>This is an automated email. Please do not reply to this email.</p>");
        html.append("<p>For any queries regarding the examination, please contact the examination authority.</p>");
        html.append("</div></body></html>");
        
        return html.toString();
    }
}