const Card = ({ children, className = "", title, subtitle }) => {
  return (
    <div
      className={`bg-white shadow-sm border border-gray-300 ${className}`}
      style={{ borderRadius: "0" }}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
