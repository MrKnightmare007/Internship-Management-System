import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import Button from './ui/Button';

const LandingPage = () => {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Kickstart Your Tech Career with WEBEL</h1>
          <p className={styles.heroSubtitle}>
            Explore exclusive internship opportunities in Data Science, Machine Learning, and more. Gain real-world experience and build your future with us.
          </p>
          <Link to="/applicant-dashboard">
            <Button variant="primary">View Open Internships</Button>
          </Link>
        </div>
      </section>
      
      <section className={styles.features}>
         <div className={styles.featureCard}>
            <h3>Real-World Projects</h3>
            <p>Work on challenging projects that solve real problems and build a portfolio that stands out.</p>
         </div>
         <div className={styles.featureCard}>
            <h3>Expert Mentorship</h3>
            <p>Receive guidance from industry experts and experienced mentors from WEBEL and partner organizations.</p>
         </div>
         <div className={styles.featureCard}>
            <h3>Career Development</h3>
            <p>Gain valuable skills, earn a certificate, and get a head start in the competitive tech industry.</p>
         </div>
      </section>
    </div>
  );
};

export default LandingPage;