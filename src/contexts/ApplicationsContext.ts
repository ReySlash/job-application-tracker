import { createContext } from "react";
import { type Application } from "../types/ApplicationType";
import type { ApplicationInput } from "../types/ApplicationInput";

type ApplicationsContext = {
  applicationsList: Application[];
  createApplication: (application: ApplicationInput) => void;
  updateApplication: (id: number, updatedApplication: ApplicationInput) => void;
  deleteApplication: (id: number) => void;
};

export default createContext<ApplicationsContext>({} as ApplicationsContext);
