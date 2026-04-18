import { useContext } from 'react';
import ApplicationsContext from '../contexts/ApplicationsContext';

function useRemove() {
  const { deleteApplication } = useContext(ApplicationsContext);
  // Confirm before deleting so clicks in the table are not destructive by accident.
  const removeApplication = (id: string, company: string) => {
    if (window.confirm(`Are you sure you want to delete this application at "${company}"?`)) {
      deleteApplication(id);
    }
  };

  return removeApplication;
}

export default useRemove;
