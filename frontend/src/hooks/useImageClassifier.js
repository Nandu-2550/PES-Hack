/**
 * useImageClassifier.js
 *
 * Custom React hook that warms up the AI model on component mount.
 *
 * Returns:
 *   modelReady  — true once the model is loaded and ready to classify images.
 *   modelError  — a human-readable error string when loading fails, or null.
 *   errorToast  — boolean flag that the consumer can use to render a one-time
 *                 inline warning banner (no external toast library required).
 *   dismissToast — call this to clear the errorToast flag after showing it.
 */

import { useState, useEffect, useCallback } from 'react';
import { loadModel } from '../services/aiEngine';

/**
 * @returns {{ modelReady: boolean, modelError: string | null, errorToast: boolean, dismissToast: () => void }}
 */
export function useImageClassifier() {
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState(null);
  // errorToast is a separate flag so the consumer can show-once and dismiss
  const [errorToast, setErrorToast] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function warmUp() {
      try {
        await loadModel();
        if (!cancelled) {
          setModelReady(true);
          setModelError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = 'AI model unavailable — connect once to download it.';
          setModelError(msg);
          setErrorToast(true);
          console.warn('useImageClassifier:', err);
        }
      }
    }

    warmUp();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only on mount

  const dismissToast = useCallback(() => setErrorToast(false), []);

  return { modelReady, modelError, errorToast, dismissToast };
}

export default useImageClassifier;
