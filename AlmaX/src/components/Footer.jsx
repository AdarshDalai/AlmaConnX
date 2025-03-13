import React from "react";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.logoContainer}>
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/047/656/219/small/abstract-logo-design-for-any-corporate-brand-business-company-vector.jpg"
            alt="Company Logo"
            style={styles.logo}
          />
          <h2 style={styles.companyName}>AlmaX</h2>
        </div>

        <p style={styles.copyright}>
          &copy; {new Date().getFullYear()} AlmaX. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

//writing inline css because it is becoming clumsy to import footer css.
const styles = {
  footer: {
    backgroundColor: "#0b1117",
    color: "white",
    textAlign: "center",
    padding: "20px 0",
    position: "relative",
    bottom: 0,
    width: "100%",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  logo: {
    width: "50px",
    height: "50px",
  },
  companyName: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: 0,
  },
  copyright: {
    fontSize: "14px",
  },
};
