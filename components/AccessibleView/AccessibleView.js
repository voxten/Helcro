import React, { createContext, useContext, useState } from "react";

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  return (
    <AccessibilityContext.Provider
      value={{ highContrast, setHighContrast, fontScale, setFontScale }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
