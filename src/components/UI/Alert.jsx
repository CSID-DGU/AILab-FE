import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Alert = ({ type = "info", title, children, onClose, className = "" }) => {
  const types = {
    success: {
      container: "bg-green-50 border-green-200",
      icon: CheckCircleIcon,
      iconColor: "text-green-400",
      titleColor: "text-green-800",
      textColor: "text-green-700",
    },
    error: {
      container: "bg-red-50 border-red-200",
      icon: XCircleIcon,
      iconColor: "text-red-400",
      titleColor: "text-red-800",
      textColor: "text-red-700",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: ExclamationTriangleIcon,
      iconColor: "text-yellow-400",
      titleColor: "text-yellow-800",
      textColor: "text-yellow-700",
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: InformationCircleIcon,
      iconColor: "text-blue-400",
      titleColor: "text-blue-800",
      textColor: "text-blue-700",
    },
  };

  const config = types[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`border p-4 ${config.container} ${className}`}
      style={{ borderRadius: "4px" }}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleColor}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.textColor} ${title ? "mt-1" : ""}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onClose}
                className={`inline-flex p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.iconColor}`}
                style={{ borderRadius: "2px" }}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
