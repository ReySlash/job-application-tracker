import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { ApplicationsPageLocationState } from '../types/ApplicationsPageLocationState';

function useBanner() {
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as ApplicationsPageLocationState;
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const message = locationState?.successMessage;
    if (!message) return;

    // This copies one-time navigation state into local UI state before clearing the route state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuccessMessage(message);

    // Clear route state so the banner does not reappear on reload/back navigation.
    navigate(location.pathname, { replace: true, state: null });
  }, [locationState, navigate, location.pathname]);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  return { successMessage, setSuccessMessage };
}

export default useBanner;
