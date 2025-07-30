import React from 'react';
import styles from './Loader.module.css';

/**
 * A simple, reusable loading spinner component.
 * It can be easily modified to use an image if a specific loader graphic is provided.
 *
 * @returns {JSX.Element} The loader component.
 */
const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinner}></div>
      {/* If you have a specific WEBEL loader image, you can use it like this: */}
      {/* <img src="/path/to/webel-loader.gif" alt="Loading..." /> */}
      <p className={styles.loadingText}>Loading...</p>
    </div>
  );
};

export default Loader;