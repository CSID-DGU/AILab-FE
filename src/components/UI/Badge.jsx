const Badge = ({
  children,
  variant = "default",
  size = "medium",
  className = "",
  icon: Icon,
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    primary: "bg-blue-600 text-white",
  };

  const sizes = {
    small: "px-2 py-1 text-xs",
    medium: "px-2.5 py-0.5 text-xs",
    large: "px-3 py-1 text-sm",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <span className={classes}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
};

export default Badge;
