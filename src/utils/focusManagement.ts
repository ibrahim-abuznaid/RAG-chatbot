/**
 * Utilities to help with focus management and accessibility
 */

/**
 * Creates a focus trap - ensures focus stays within a container
 * @param containerRef Reference to the container element
 * @param focusableSelector Selector for focusable elements
 */
export const createFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  focusableSelector: string = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
) => {
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // If going backward and on first element, go to last element
    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    } 
    // If going forward and on last element, go to first element
    else if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  };

  const activate = () => {
    document.addEventListener('keydown', handleTabKey);
  };

  const deactivate = () => {
    document.removeEventListener('keydown', handleTabKey);
  };

  return { activate, deactivate };
};

/**
 * Return focus to a previously focused element
 * @param previousFocus The element to return focus to
 */
export const returnFocus = (previousFocus: HTMLElement | null) => {
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  }
};

/**
 * Safe focus - properly focuses an element with error handling
 * @param element Element to focus
 */
export const safeFocus = (element: HTMLElement | null) => {
  if (!element) return;
  
  try {
    // Set tabindex if element is not normally focusable
    if (!element.hasAttribute('tabindex') && 
        !element.tagName.match(/^(a|button|input|select|textarea)$/i)) {
      element.setAttribute('tabindex', '-1');
    }
    
    element.focus();
  } catch (e) {
    console.error('Error focusing element:', e);
  }
}; 