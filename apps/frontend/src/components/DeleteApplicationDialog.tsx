type Props = {
  deleteApplication: (applicationId: string) => Promise<void>;
  applicationId: string;
  onClose: () => void;
  isDeleting: boolean;
};

function DeleteApplicationDialog(props: Props) {
  const { deleteApplication, applicationId, onClose, isDeleting } = props;
  return (
    <dialog
      className="fixed inset-0 m-auto flex h-fit w-fit flex-col gap-4 rounded-lg border border-gray-300 bg-white p-6 text-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
      open
    >
      <p>Are you sure you want to delete this application?</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded border border-slate-700 px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          onClick={() => deleteApplication(applicationId)}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          ) : (
            'Delete'
          )}
        </button>
      </div>
    </dialog>
  );
}

export default DeleteApplicationDialog;
