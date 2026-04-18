import { useEffect, useState, type ReactNode } from "react";
import ApplicationsContext from "../contexts/ApplicationsContext";
import type { Application } from "../types/ApplicationType";
import { applications } from "../data/ApplicationsList";
import type { ApplicationInput } from "../types/ApplicationInput";

type Props = {
  children: ReactNode;
};

function ApplicationsProvider(props: Props) {
  const { children } = props;

  const getData = (): Application[] => {
    const data = localStorage.getItem("applications");

    if (!data) {
      return applications;
    }

    try {
      return JSON.parse(data) as Application[];
    } catch {
      return applications;
    }
  };

  const [applicationsState, setApplicationsState] =
    useState<Application[]>(getData);

  useEffect(() => {
    localStorage.setItem("applications", JSON.stringify(applicationsState));
  }, [applicationsState]);

  const createApplication = (application: ApplicationInput) => {
    const now = new Date().toISOString();
    const newApplication: Application = {
      id: crypto.randomUUID(),
      ...application,
      createdAt: now,
      updatedAt: now,
    };

    setApplicationsState((current) => [newApplication, ...current]);
  };

  const updateApplication = (id: string, input: ApplicationInput) => {
    setApplicationsState((current) =>
      current.map((a) =>
        a.id === id
          ? { ...a, ...input, updatedAt: new Date().toISOString() }
          : a,
      ),
    );
  };

  const deleteApplication = (id: string) => {
    setApplicationsState((current) =>
      current.filter((application) => application.id !== id),
    );
  };

  return (
    <ApplicationsContext.Provider
      value={{
        applicationsList: applicationsState,
        createApplication,
        updateApplication,
        deleteApplication,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
}

export default ApplicationsProvider;
