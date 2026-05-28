import type { Application } from "../types/ApplicationType";

type Props = {
  status: Application["status"];
};

function StatusBadge({ status }: Props) {
  return (
    <span
      className={`px-2 py-1 rounded-md text-white text-sm ${
        status === "applied"
          ? "bg-gray-500"
          : status === "interview"
            ? "bg-yellow-500"
            : status === "offer"
              ? "bg-green-500"
              : "bg-red-500"
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
