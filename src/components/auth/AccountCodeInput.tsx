"use client";

import { ClipboardEvent, KeyboardEvent, useRef, useState } from "react";

import styles from "./auth.module.css";
import { ACCOUNT_CONFIRMATION_CODE_LENGTH } from "../../lib/auth/accountConfirmation";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, ACCOUNT_CONFIRMATION_CODE_LENGTH);
}

export function applyAccountCodeInput(
  currentDigits: string[],
  value: string,
  startIndex = 0,
) {
  const nextDigits = [...currentDigits];
  const incomingDigits = onlyDigits(value);

  if (!incomingDigits) {
    nextDigits[startIndex] = "";
    return {
      digits: nextDigits,
      nextFocusIndex: startIndex,
    };
  }

  incomingDigits.split("").forEach((digit, offset) => {
    const index = startIndex + offset;
    if (index < ACCOUNT_CONFIRMATION_CODE_LENGTH) {
      nextDigits[index] = digit;
    }
  });

  return {
    digits: nextDigits,
    nextFocusIndex: Math.min(
      startIndex + incomingDigits.length,
      ACCOUNT_CONFIRMATION_CODE_LENGTH - 1,
    ),
  };
}

type AccountCodeInputProps = {
  codeName?: string;
  label?: string;
};

export function AccountCodeInput({
  codeName = "account_code",
  label = "Six-digit account confirmation code",
}: AccountCodeInputProps) {
  const [digits, setDigits] = useState<string[]>(
    Array(ACCOUNT_CONFIRMATION_CODE_LENGTH).fill(""),
  );
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const code = digits.join("");

  function focusIndex(index: number) {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  }

  function applyCode(value: string, startIndex = 0) {
    const nextState = applyAccountCodeInput(digits, value, startIndex);

    setDigits(nextState.digits);
    focusIndex(nextState.nextFocusIndex);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    applyCode(event.clipboardData.getData("text"));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }

    if (
      event.key === "ArrowRight" &&
      index < ACCOUNT_CONFIRMATION_CODE_LENGTH - 1
    ) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  }

  return (
    <fieldset className={styles.accountCodeFieldset}>
      <legend className={styles.loginLabel}>{label}</legend>
      <input type="hidden" name={codeName} value={code} />
      <div className={styles.accountCodeDigits} role="group" aria-label={label}>
        {digits.map((digit, index) => (
          <input
            aria-label={`Digit ${index + 1} of ${ACCOUNT_CONFIRMATION_CODE_LENGTH}`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            className={styles.accountCodeDigit}
            inputMode="numeric"
            key={index}
            maxLength={1}
            onChange={(event) => applyCode(event.target.value, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onPaste={handlePaste}
            pattern="[0-9]*"
            ref={(input) => {
              inputsRef.current[index] = input;
            }}
            required
            type="text"
            value={digit}
          />
        ))}
      </div>
    </fieldset>
  );
}
