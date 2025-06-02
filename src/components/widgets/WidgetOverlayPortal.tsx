import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface WidgetOverlayPortalProps {
  children: React.ReactNode;
  anchorRect: DOMRect | null;
  onClose?: () => void;
}

const portalRootId = "dashboard-widget-portal-root";

export const WidgetOverlayPortal: React.FC<WidgetOverlayPortalProps> = ({
  children,
  anchorRect,
  onClose,
}) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let root = document.getElementById(portalRootId);
    if (!root) {
      root = document.createElement("div");
      root.id = portalRootId;
      document.body.appendChild(root);
    }
    setPortalRoot(root);
    return () => {
      if (root && root.childElementCount === 0) {
        root.remove();
      }
    };
  }, []);

  // Close on escape
  useEffect(() => {
    if (!onClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!portalRoot || !anchorRect) return null;

  // Position overlay over the anchor rect (original logic)
  const style: React.CSSProperties = {
    position: "fixed",
    left: anchorRect.left,
    top: anchorRect.top,
    width: anchorRect.width,
    height: anchorRect.height,
    zIndex: 1000,
    pointerEvents: "auto",
    transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
    boxShadow:
      "0 16px 40px 0 rgba(59,130,246,0.18), 0 2px 8px 0 rgba(59,130,246,0.12)",
    background: "white",
    borderRadius: "0.75rem",
    overflow: "visible",
  };

  return createPortal(
    <div
      ref={overlayRef}
      style={style}
      className="process-widget-overlay"
      onMouseLeave={onClose}
      tabIndex={-1}
    >
      {children}
    </div>,
    portalRoot
  );
};
