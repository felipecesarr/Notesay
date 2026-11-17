import { useState, useEffect, useCallback, RefObject } from "react";


export function useTextSelection(containerRef?: RefObject<HTMLElement | null>) {
  const [selectedText, setSelectedText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      // Check if selection is within the container if ref provided
      if (containerRef?.current) {
        const range = selection?.getRangeAt(0);
        const commonAncestor = range?.commonAncestorContainer;
        
        if (commonAncestor && containerRef.current.contains(commonAncestor)) {
          setSelectedText(text);
          setIsOpen(true);
        }
      } else {
        setSelectedText(text);
        setIsOpen(true);
      }
    } else {
      setIsOpen(false);
    }
  }, [containerRef]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedText("");
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    const element = containerRef?.current || document;
    
    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(handleSelection, 10);
    };

    element.addEventListener("mouseup", handleMouseUp);
    element.addEventListener("touchend", handleMouseUp);

    return () => {
      element.removeEventListener("mouseup", handleMouseUp);
      element.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleSelection, containerRef]);

  return {
    selectedText,
    isOpen,
    handleClose,
  };
}
