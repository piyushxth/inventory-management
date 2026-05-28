import React from "react";

interface ComponentCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  return (
    <div className={`rounded-2xl bg-white dark:bg-gray-700 ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-semibold">{title}</h3>
          {desc && <p className="text-sm text-gray-500 mt-1">{desc}</p>}
        </div>
      )}

      {/* Card Body */}
      <div>
        <div className="">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
