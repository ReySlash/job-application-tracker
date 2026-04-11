import { useState, type ReactNode } from "react";
import ApplicationsContext from "../contexts/ApplicationsContext";
import { applications, type Application } from "../types/ApplicationType";

type Props = {
  children: ReactNode;
};

function ApplicationsProvider(props: Props) {
  const { children } = props;
  const [applicationsState, setApplicationsState] = useState(applications);
  const createApplication = (application: Application) => {
    setApplicationsState([application, ...applicationsState]);
  };
  const deleteApplication = (id: number) => {
    setApplicationsState(
      applicationsState.filter((application) => application.id !== id),
    );
  };
  return (
    <ApplicationsContext.Provider
      value={{
        applicationsList: applicationsState,
        createApplication: createApplication,
        deleteApplication: deleteApplication,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
}

export default ApplicationsProvider;
