
import React from "react";

interface InfoCardGridProps {
  children: React.ReactNode;
  className?: string;
}

const InfoCardGrid: React.FC<InfoCardGridProps> = ({ children, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  );
};

export default InfoCardGrid;
