import { useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import ApplicationsContext from "../contexts/ApplicationsContext";
import type { ApplicationInput } from "../types/ApplicationInput";
import { type ApplicationsFormSchema } from "../schemas/ApplicationsFormSchema";
import ApplicationForm from "../components/ApplicationForm";

function ApplicationFormPage() {
  // Route state decides whether this page creates a new record or edits one.
  const params = useParams();
  const applicationId = params.id;
  const isEditing = Boolean(params.id);
  const { applicationsList, createApplication, updateApplication } =
    useContext(ApplicationsContext);
  const navigate = useNavigate();

  // Default values used when the form is opened in create mode.
  const emptyFormState = useMemo<ApplicationInput>(
    () => ({
      company: "",
      role: "",
      status: "applied",
      appliedAt: new Date().toISOString().split("T")[0],
      location: "",
      jobUrl: "",
      notes: "",
    }),
    [],
  );

  const applicationToUpdate = applicationsList.find(
    (application) => application.id === applicationId,
  );

  // RHF reads this once on mount, then the effect below keeps edit-mode data synced.
  const initialFormState: ApplicationInput = useMemo(
    () =>
      isEditing && applicationToUpdate ? applicationToUpdate : emptyFormState,
    [applicationToUpdate, emptyFormState, isEditing],
  );

  // Valid data from Zod is saved through the shared applications provider.
  const onSubmit = (applicationInput: ApplicationsFormSchema) => {
    if (isEditing && applicationToUpdate) {
      updateApplication(applicationToUpdate.id, applicationInput);
    } else {
      createApplication(applicationInput);
    }
    navigate("/applications", {
      state: {
        successMessage: isEditing
          ? "Application updated successfully!"
          : "Application created successfully!",
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        {isEditing ? "Update Application" : "New Application"}
      </h2>

      <ApplicationForm
        onSubmit={onSubmit}
        initialFormState={initialFormState}
        isEditing={isEditing}
      />
    </div>
  );
}

export default ApplicationFormPage;
