package com.webel.ims.service;

import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.resolver.font.DefaultFontProvider;
import com.webel.ims.AcceptedStudent;
import com.webel.ims.ExamDetails;
import com.webel.ims.ExamShift;
import com.google.zxing.WriterException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
public class AdmitCardPDFService {
    
    @Autowired
    private BarcodeService barcodeService;
    
    public byte[] generateAdmitCardPDF(AcceptedStudent acceptedStudent, ExamDetails examDetails, ExamShift examShift) 
            throws IOException, WriterException {
        
        // Generate barcode for registration number
        byte[] barcodeBytes = barcodeService.generateBarcode(acceptedStudent.getRegistrationNumber());
        String barcodeBase64 = Base64.getEncoder().encodeToString(barcodeBytes);
        
        // Create HTML content for the admit card
        String htmlContent = generateAdmitCardHTML(acceptedStudent, examDetails, examShift, barcodeBase64);
        
        // Convert HTML to PDF
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ConverterProperties properties = new ConverterProperties();
        properties.setFontProvider(new DefaultFontProvider());
        
        HtmlConverter.convertToPdf(htmlContent, outputStream, properties);
        
        return outputStream.toByteArray();
    }
    
    private String generateAdmitCardHTML(AcceptedStudent acceptedStudent, ExamDetails examDetails, 
                                       ExamShift examShift, String barcodeBase64) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        String programTitle = examDetails.getProgram() != null ? examDetails.getProgram().getIntProgName() : "Internship Program";
        String studentName = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getApplicantName() : "Student";
        String email = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getApplicantEmail() : "";
        String phone = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getApplicantPhone() : "";
        String university = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getUniversityName() : "";
        String rollNo = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getUniversityRollNo() : "";
        String dob = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getDob() : "";
        String college = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getCollegeNameAddress() : "";
        String course = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getCourseStream() : "";
        String semester = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getCurrentSemester() : "";
        String address = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getCurrentAddress() : "";
        
        // Get passport photo and signature paths and convert to base64
        String passportPhotoPath = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getPassportPhotoPath() : null;
        String signaturePath = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getSignaturePath() : null;
        
        // Convert images to base64 for embedding
        String passportPhotoBase64 = convertImageToBase64(passportPhotoPath);
        String signatureBase64 = convertImageToBase64(signaturePath);
        
        // Get organizer signature from exam details
        String organizerSignaturePath = examDetails.getOrganizerSignaturePath();
        String organizerSignatureBase64 = convertImageToBase64(organizerSignaturePath);
        
        // Convert WEBEL logo to base64 for watermark
        String webelLogoBase64 = convertImageToBase64("./frontend/organization-ims-frontend/public/assets/img/Webel_logo.png");
        
        // Get organization abbreviation from the program - for now use default
        String organizingInstitute = "WEBEL"; // Default
        // TODO: Add organization relationship to InternshipProgram if needed
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><style>");
        
        // CSS based on the provided AdmitCard.css with page breaks and watermark
        html.append("@page { margin: 15mm; size: A4; }");
        html.append("body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f0f6ff; position: relative; }");
        html.append(".watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-20deg); opacity: 0.1; z-index: -1; pointer-events: none; }");
        html.append(".watermark img { width: 200px; height: auto; }");
        html.append(".admit-wrapper { display: flex; justify-content: center; background: #f0f6ff; padding: 20px; position: relative; z-index: 1; }");
        html.append(".admit-card { width: 900px; background: #fff; border: 3px solid #1e40af; border-radius: 6px; padding: 20px; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15); font-family: Arial, sans-serif; }");
        html.append(".page-break { page-break-before: always; }");
        html.append(".logo-header { display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }");
        html.append(".logo-header img { width: 60px; height: 60px; margin-right: 15px; }");
        html.append(".logo-header .header-text { text-align: center; }");
        html.append(".admit-header { text-align: center; background: #1e3a8a; color: #fff; padding: 15px 0; border-radius: 4px 4px 0 0; margin-bottom: 20px; }");
        html.append(".admit-header h2 { font-size: 14px; margin: 0; font-weight: 500; }");
        html.append(".admit-header h1 { font-size: 20px; margin: 3px 0 0; font-weight: bold; }");
        html.append(".top-section { display: flex; justify-content: space-between; margin-bottom: 15px; }");
        html.append(".photo-box { width: 120px; height: 150px; border: 2px solid #1e40af; display: flex; justify-content: center; align-items: center; color: #555; font-size: 12px; }");
        html.append(".details { flex: 1; padding: 0 15px; }");
        html.append(".details p { margin: 4px 0; font-size: 14px; }");
        html.append(".details strong { color: #1e40af; }");
        html.append(".details p:nth-child(odd) { background: #f0f6ff; padding: 3px; border-radius: 4px; }");
        html.append(".barcode-box { width: 150px; height: 60px; border: 2px dashed #1e40af; text-align: center; font-size: 12px; font-weight: bold; color: #1e40af; line-height: 60px; }");
        html.append(".signature-block { margin-top: 10px; margin-bottom: 20px; }");
        html.append(".candidate-sign { border: 1px solid #000; width: 250px; height: 60px; margin: 10px auto; text-align: center; font-size: 12px; padding-top: 35px; color: #444; }");
        html.append(".sig-line { border-bottom: 1px solid #000; width: 200px; margin: 0 auto; font-size: 12px; padding-top: 20px; }");
        html.append(".footer-block { display: flex; justify-content: space-between; margin-top: 20px; border-top: 2px solid #1e40af; padding-top: 15px; }");
        html.append(".institute { text-align: left; flex: 1; }");
        html.append(".institute h3 { margin: 5px 0 0; color: #1e40af; font-size: 16px; }");
        html.append(".institute p { margin: 2px 0; font-size: 12px; color: #666; }");
        html.append(".signatory { text-align: right; flex: 1; font-size: 12px; }");
        html.append(".signatory .sig-line { margin-bottom: 5px; border-bottom: 1px solid #000; width: 150px; height: 50px; margin-left: auto; }");
        html.append(".signatory p { margin: 2px 0; color: #666; }");
        html.append(".instructions { margin-top: 20px; border: 2px solid #1e40af; }");
        html.append(".instructions h3 { background: #1e40af; color: #fff; padding: 6px; font-size: 15px; margin: 0; }");
        html.append(".instructions ol { background: #fff9db; padding: 15px 25px; font-size: 13px; line-height: 1.5; }");
        html.append(".instructions li { margin-bottom: 6px; }");
        html.append("</style></head>");
        html.append("<body>");
        
        // Add watermark
        if (webelLogoBase64 != null) {
            html.append("<div class='watermark'>");
            html.append("<img src='data:image/png;base64,").append(webelLogoBase64).append("' alt='WEBEL Logo'>");
            html.append("</div>");
        }
        
        html.append("<div class='admit-wrapper'>");
        html.append("<div class='admit-card'>");
        
        // Header with logo
        html.append("<div class='logo-header'>");
        if (webelLogoBase64 != null) {
            html.append("<img src='data:image/png;base64,").append(webelLogoBase64).append("' alt='WEBEL Logo'>");
        }
        html.append("<div class='header-text'>");
        html.append("<h2 style='margin: 0; font-size: 16px; color: #1e40af;'>WEST BENGAL ELECTRONICS INDUSTRY DEVELOPMENT CORPORATION LIMITED</h2>");
        html.append("</div>");
        html.append("</div>");
        
        html.append("<div class='admit-header'>");
        html.append("<h2>INTERNSHIP EXAMINATION 2025</h2>");
        html.append("<h1>ADMIT CARD</h1>");
        html.append("</div>");
        
        html.append("<div class='top-section'>");
        
        // Candidate Photo Section
        html.append("<div class='photo-box'>");
        if (passportPhotoBase64 != null) {
            html.append("<img src='data:image/jpeg;base64,").append(passportPhotoBase64).append("' alt='Photo' style='width: 100%; height: 100%; object-fit: cover;'>");
        } else {
            html.append("Photo");
        }
        html.append("</div>");
        
        // Candidate Details Section
        html.append("<div class='details'>");
        html.append("<p><strong>Name:</strong> ").append(studentName.toUpperCase()).append("</p>");
        html.append("<p><strong>Registration No:</strong> ").append(acceptedStudent.getRegistrationNumber()).append("</p>");
        html.append("<p><strong>Internship Title:</strong> ").append(programTitle).append("</p>");
        html.append("<p><strong>Date:</strong> ").append(examDetails.getExaminationDate().format(dateFormatter)).append(" (Saturday)</p>");
        html.append("<p><strong>Time:</strong> ").append(examShift.getStartTime().format(timeFormatter)).append(" to ").append(examShift.getEndTime().format(timeFormatter)).append("</p>");
        html.append("<p><strong>Examination Centre:</strong> ").append(examDetails.getExaminationCentreNo()).append("</p>");
        html.append("<p><strong>Venue:</strong> ").append(examDetails.getExaminationLocation()).append("</p>");
        
        // Add government ID information if available  
        String govIdType = acceptedStudent.getApplication() != null ? acceptedStudent.getApplication().getGovernmentIdType() : "Aadhaar ID";
        html.append("<p><strong>Photo Id:</strong> 990002722543 (").append(govIdType != null ? govIdType : "Aadhaar ID").append(")</p>");
        
        html.append("</div>");
        
        // Barcode Section
        html.append("<div class='barcode-box'>");
        html.append("<img src='data:image/png;base64,").append(barcodeBase64).append("' alt='Barcode' style='width: 100%; height: 100%; object-fit: contain;'>");
        html.append("</div>");
        
        html.append("</div>"); // End top-section
        
        // Candidate Signature Section
        html.append("<div class='signature-block'>");
        html.append("<div class='candidate-sign'>");
        if (signatureBase64 != null) {
            html.append("<img src='data:image/jpeg;base64,").append(signatureBase64).append("' alt='Candidate Signature' style='width: 200px; height: 40px; object-fit: contain; border-bottom: 1px solid #000; margin: 0 auto; display: block;'>");
        }
        html.append("<div class='sig-line'>Candidate Signature</div>");
        html.append("</div>");
        html.append("</div>");
        
        // Institute + Authorized Signatory Footer with proper left-right alignment
        html.append("<div class='footer-block'>");
        html.append("<div class='institute'>");
        html.append("<p style='margin: 0; font-size: 12px; color: #666;'>Organizing Institute</p>");
        html.append("<h3>").append(organizingInstitute).append("</h3>");
        html.append("<p style='margin: 0; font-size: 10px; color: #666;'>West Bengal Electronics Industry Development Corporation Limited</p>");
        html.append("</div>");
        html.append("<div class='signatory'>");
        if (organizerSignatureBase64 != null) {
            html.append("<div class='sig-line' style='display: flex; justify-content: center; align-items: center; margin-bottom: 5px; border-bottom: 1px solid #000; width: 150px; height: 50px; margin-left: auto;'>");
            html.append("<img src='data:image/jpeg;base64,").append(organizerSignatureBase64).append("' alt='Organizer Signature' style='max-width: 140px; max-height: 40px; object-fit: contain;'>");
            html.append("</div>");
        } else {
            html.append("<div class='sig-line'></div>");
        }
        html.append("<p style='margin: 2px 0; font-size: 12px;'>Authorized Signatory</p>");
        html.append("<p style='margin: 0; font-size: 10px;'>Internship Committee 2025</p>");
        html.append("</div>");
        html.append("</div>");
        
        html.append("</div>"); // End admit-card
        html.append("</div>"); // End admit-wrapper
        
        // PAGE 2 - Instructions only
        html.append("<div class='page-break'></div>");
        
        // Add watermark for page 2 as well
        if (webelLogoBase64 != null) {
            html.append("<div class='watermark'>");
            html.append("<img src='data:image/png;base64,").append(webelLogoBase64).append("' alt='WEBEL Logo'>");
            html.append("</div>");
        }
        
        html.append("<div class='admit-wrapper'>");
        html.append("<div class='admit-card'>");
        
        // Instructions Section (Full Page 2)
        html.append("<div class='instructions'>");
        html.append("<h3>Important Instructions for the Candidate</h3>");
        html.append("<ol>");
        html.append("<li>An electronic copy of the Admit Card is <strong>NOT acceptable</strong>. Bring a printed copy and valid photo ID (Passport, PAN Card, Voter ID, Aadhaar, Driving License).</li>");
        html.append("<li>Reach the examination venue at least 90 minutes before the commencement of the exam.</li>");
        html.append("<li>Candidates will NOT be allowed to login 30 minutes after the scheduled start of the exam.</li>");
        html.append("<li>A virtual scientific calculator will be available on the computer screen.</li>");
        html.append("<li>Mobile phones, watches, or any other electronic devices are prohibited.</li>");
        html.append("<li>A scribble pad will be provided for rough work; return it after the exam.</li>");
        html.append("<li>Bring your own pen and pencil.</li>");
        html.append("<li>Candidates will not be allowed to leave the exam hall before the end of the exam.</li>");
        html.append("<li>Misconduct will lead to cancellation of candidature and disciplinary action.</li>");
        html.append("<li>PwD candidates may bring assistive devices as approved.</li>");
        html.append("<li>Follow instructions given by the invigilator strictly.</li>");
        html.append("<li>Keep the Admit Card safe for future reference after the exam.</li>");
        html.append("</ol>");
        html.append("</div>");
        
        html.append("</div>"); // End admit-card page 2
        html.append("</div>"); // End admit-wrapper page 2
        html.append("</body></html>");
        
        return html.toString();
    }
    
    /**
     * Convert image file to base64 string for embedding in HTML
     * @param filePath The file path (can be relative like "./uploads/..." or absolute)
     * @return Base64 encoded string or null if file not found/error
     */
    private String convertImageToBase64(String filePath) {
        if (filePath == null || filePath.trim().isEmpty()) {
            return null;
        }
        
        try {
            // Handle relative paths by converting to absolute
            Path path;
            if (filePath.startsWith("./")) {
                // Remove the ./ prefix and create path from current directory
                String relativePath = filePath.substring(2);
                path = Paths.get(relativePath).toAbsolutePath();
            } else {
                path = Paths.get(filePath);
            }
            
            // Check if file exists
            if (!Files.exists(path)) {
                System.err.println("Image file not found: " + path.toString());
                return null;
            }
            
            // Read file and convert to base64
            byte[] imageBytes = Files.readAllBytes(path);
            return Base64.getEncoder().encodeToString(imageBytes);
            
        } catch (Exception e) {
            System.err.println("Error converting image to base64: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}