"use client";

import { useState } from "react";

import styles from "./auth.module.css";

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.loginFieldIcon}>
      <path d="M7 10h10v9H7z" />
      <path d="M9 10V7.8a3 3 0 0 1 6 0V10" />
      <path d="M12 13.5v2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.loginEyeIcon}>
      <path d="M2.8 12s3.4-5 9.2-5 9.2 5 9.2 5-3.4 5-9.2 5-9.2-5-9.2-5Z" />
      <circle cx="12" cy="12" r="2.3" />
    </svg>
  );
}

type PasswordInputProps = {
  autoComplete?: "current-password" | "new-password";
  minLength?: number;
  placeholder?: string;
};

export function PasswordInput({
  autoComplete = "current-password",
  minLength,
  placeholder = "Enter your password",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.loginInputShell}>
      <LockIcon />
      <input
        className={styles.loginInput}
        id="password"
        name="password"
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        placeholder={placeholder}
        required
      />
      <button
        className={styles.loginPasswordToggle}
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((current) => !current)}
      >
        <EyeIcon />
      </button>
    </div>
  );
}
