import { createContext } from "react";
import { type Application } from "../types/ApplicationType";

type ApplicationsContext = {
  applicationsList: Application[];
  createApplication: (application: Application) => void;
  deleteApplication: (id: number) => void;
};

export default createContext<ApplicationsContext>({} as ApplicationsContext);
