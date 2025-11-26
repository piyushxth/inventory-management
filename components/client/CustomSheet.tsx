"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

// Create context for the sheet
interface SheetContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SheetContext = createContext<SheetContextType | null>(null);

// Sheet root component
interface SheetProps {
  children: React.ReactNode;
  side?: "left" | "right";
}

const Sheet: React.FC<SheetProps> = ({ children, side = "right" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);
  
  return (
    <SheetContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SheetContext.Provider>
  );
};

// Sheet trigger component
interface SheetTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const SheetTrigger: React.FC<SheetTriggerProps> = ({ children, asChild = false }) => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("SheetTrigger must be used within a Sheet");
  }
  
  const { open } = context;
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { onClick: open });
  }
  
  return (
    <div onClick={open} className="cursor-pointer">
      {children}
    </div>
  );
};

// Sheet content component
interface SheetContentProps {
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}

const SheetContent: React.FC<SheetContentProps> = ({ 
  children, 
  side = "right", 
  className = "" 
}) => {
  const context = useContext(SheetContext);
  const sheetRef = useRef<HTMLDivElement>(null);
  
  if (!context) {
    throw new Error("SheetContent must be used within a Sheet");
  }
  
  const { isOpen, close } = context;
  
  // Close sheet when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        close();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, close]);
  
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with blur effect */}
      <div 
        className={`
          fixed inset-0 backdrop-blur-sm transition-all duration-300 ease-in-out
          ${isOpen ? ' bg-black/70' : ' '}
        `}
        onClick={close}
      />
      
      {/* Sheet content with smooth transition */}
      <div
        ref={sheetRef}
        className={`
          fixed top-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out
          ${side === "left" ? "left-0" : "right-0"}
          ${isOpen ? "translate-x-0" : (side === "left" ? "-translate-x-full" : "translate-x-full")}
          w-full max-w-md flex flex-col
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
};

// Sheet header component
interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const SheetHeader: React.FC<SheetHeaderProps> = ({ children, className = "" }) => {
  return (
    <div className={`p-6 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Sheet title component
interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

const SheetTitle: React.FC<SheetTitleProps> = ({ children, className = "" }) => {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>
      {children}
    </h2>
  );
};

// Sheet description component
interface SheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const SheetDescription: React.FC<SheetDescriptionProps> = ({ children, className = "" }) => {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
      {children}
    </p>
  );
};

// Sheet footer component
interface SheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

const SheetFooter: React.FC<SheetFooterProps> = ({ children, className = "" }) => {
  return (
    <div className={`p-6 border-t border-gray-200 mt-auto ${className}`}>
      {children}
    </div>
  );
};

// Sheet close component
interface SheetCloseProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const SheetClose: React.FC<SheetCloseProps> = ({ children, asChild = false }) => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("SheetClose must be used within a Sheet");
  }
  
  const { close } = context;
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { onClick: close });
  }
  
  return (
    <div onClick={close} className="cursor-pointer">
      {children}
    </div>
  );
};

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
};