"use client";

import { useState, useEffect } from 'react';

function getValueFromLocalStorage(key, initialValue) {
    // This function needs to be standalone so it can be called by useState
    // without breaking the rules of hooks.
    if (typeof window === 'undefined') {
        return initialValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
    } catch (error) {
        console.error(error);
        return initialValue;
    }
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    return getValueFromLocalStorage(key, initialValue);
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  // This effect handles the case where the value is updated from another tab.
  useEffect(() => {
    const handleStorageChange = (e) => {
        if (e.key === key) {
            setStoredValue(getValueFromLocalStorage(key, initialValue))
        }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange)
  }, []);

  return [storedValue, setValue];
}