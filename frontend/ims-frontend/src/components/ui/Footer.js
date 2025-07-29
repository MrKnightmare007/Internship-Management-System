import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footerWrap}>
            <div className={styles.footerWidgets}>
                <div className={styles.container}>
                    <div className={styles.row}>
                        {/* Column 1: Logo and Socials */}
                        <div className={`${styles.col} ${styles.col_xl_3}`}>
                            <div className={styles.singleWidget}>
                                <a href="https://www.webel.in/">
                                    {/* Make sure this image is in public/assets/img/ */}
                                    <img src="/assets/img/Webel_logo.png" alt="Webel Logo" className={styles.footerLogo} />
                                </a>
                                <p className={styles.tagline}>Celebrating 50 Years of Journey and service to the nation.</p>
                                <div className={styles.socialLink}>
                                    <a href="https://www.facebook.com/Webel1974" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                                    <a href="https://twitter.com/news_webel" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                                    <a href="https://www.linkedin.com/company/west-bengal-electronics-industry-development-corporation-limited" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
                                    <a href="https://www.youtube.com/channel/UCoGapkE44gVtPnt5w0HyvnA" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Internal Links */}
                        <div className={`${styles.col} ${styles.col_xl_2}`}>
                            <div className={styles.singleWidget}>
                                <h4 className={styles.widTitle}>Internal links</h4>
                                <ul>
                                    <li><a href="https://webel.in/intranet">Intranet</a></li>
                                    <li><a href="https://webel.in/notice-board">Notice Board</a></li>
                                    <li><a href="https://outlook.office.com/mail/" target="_blank" rel="noopener noreferrer">Mail Box Login</a></li>
                                    <li><a href="https://webel.in/tenders">Tenders</a></li>
                                    <li><a href="https://webel.in/sitemap">Sitemap</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Column 3: Company Links */}
                        <div className={`${styles.col} ${styles.col_xl_2}`}>
                            <div className={styles.singleWidget}>
                                <h4 className={styles.widTitle}>Company</h4>
                                <ul>
                                    <li><a href="https://webel.in/about">About Us</a></li>
                                    <li><a href="https://webel.in/board-of-directors">Board of Directors</a></li>
                                    <li><a href="https://webel.in/RTI">RTI</a></li>
                                    <li><a href="https://webel.in/awards">Awards</a></li>
                                </ul>
                            </div>
                        </div>

                        {/* Column 4: Important Links */}
                        <div className={`${styles.col} ${styles.col_xl_3}`}>
                            <div className={styles.singleWidget}>
                                <h4 className={styles.widTitle}>Important Links</h4>
                                <ul>
                                    <li><a href="https://wb.gov.in/" target="_blank" rel="noopener noreferrer">Egiye Bangla</a></li>
                                    <li><a href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer">National Portal of India</a></li>
                                    <li><a href="https://itewb.gov.in/" target="_blank" rel="noopener noreferrer">Department of IT&E, GoWB</a></li>
                                    <li><a href="https://www.meity.gov.in/" target="_blank" rel="noopener noreferrer">MeitY, Government of India</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <div className={styles.container}>
                    <p>© {new Date().getFullYear()} <a href="https://webel.in">Webel</a>. All Rights Reserved</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;