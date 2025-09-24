import React from "react";
import "./AdmitCard.css";

export default function AdmitCard() {
  return (
    <div className="admit-wrapper">
      <div className="admit-card">
        {/* Header */}
        <div className="admit-header">
          <h2>INTERNSHIP EXAMINATION 2025</h2>
          <h1>ADMIT CARD</h1>
        </div>

        {/* Candidate Info */}
        <div className="top-section">
          {/* Candidate Photo */}
          <div className="photo-box">Photo</div>

          {/* Candidate Details */}
          <div className="details">
            <p>
              <strong>Name:</strong> SOUMYADIPTA DAS
            </p>
            <p>
              <strong>Registration No:</strong> CS25S26522498
            </p>
            <p>
              <strong>Internship Title:</strong> Summer Internship in Java
            </p>
            <p>
              <strong>Date:</strong> 1st February 2025 (Saturday)
            </p>
            <p>
              <strong>Time:</strong> 2:30 PM to 5:30 PM
            </p>
            <p>
              <strong>Examination Centre:</strong> 6522
            </p>
            <p>
              <strong>Venue:</strong> TCS Gito Bitan 6, Block DN, Plot No 54 and
              55, Sector V, Bidhan Nagar East, Salt Lake, Kolkata, West Bengal,
              PIN: 700091, India
            </p>
            <p>
              <strong>Photo Id:</strong> 990002722543 (Aadhaar ID)
            </p>
          </div>

          {/* Barcode */}
          <div className="barcode-box">[Barcode]</div>
        </div>

        {/* Candidate Signature */}
        <div className="signature-block">
          <div className="candidate-sign">
            <div className="sig-line">Candidate Signature</div>
          </div>
        </div>

        {/* Institute + Authorized Signatory */}
        <div className="footer-block">
          <div className="institute">
            <p>Organizing Institute</p>
            <h3>WEBEL</h3>
          </div>
          <div className="signatory">
            <div className="sig-line"></div>
            <p>
              Authorized Signatory
              <br />
              Internship Committee 2025
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="instructions">
          <h3>Important Instructions for the Candidate</h3>
          <ol>
            <li>
              An electronic copy of the Admit Card is{" "}
              <strong>NOT acceptable</strong>. Bring a printed copy and valid
              photo ID (Passport, PAN Card, Voter ID, Aadhaar, Driving License).
            </li>
            <li>
              Reach the examination venue at least 90 minutes before the
              commencement of the exam.
            </li>
            <li>
              Candidates will NOT be allowed to login 30 minutes after the
              scheduled start of the exam.
            </li>
            <li>
              A virtual scientific calculator will be available on the computer
              screen.
            </li>
            <li>
              Mobile phones, watches, or any other electronic devices are
              prohibited.
            </li>
            <li>
              A scribble pad will be provided for rough work; return it after
              the exam.
            </li>
            <li>Bring your own pen and pencil.</li>
            <li>
              Candidates will not be allowed to leave the exam hall before the
              end of the exam.
            </li>
            <li>
              Misconduct will lead to cancellation of candidature and
              disciplinary action.
            </li>
            <li>PwD candidates may bring assistive devices as approved.</li>
            <li>Follow instructions given by the invigilator strictly.</li>
            <li>
              Keep the Admit Card safe for future reference after the exam.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
