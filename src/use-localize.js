import React, { useContext } from 'react';
import { LocalizationContext } from './Provider';

export function useLocalize() {
  return useContext(LocalizationContext);
}
