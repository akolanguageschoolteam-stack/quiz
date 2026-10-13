"use client";

import React, { useEffect, useRef } from "react";

interface WmShapeProps {
  id?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
  roundedMobile?: string;
  cornerRounded?: string;
  cornerRoundedMobile?: string;
  cornerSize?: string;
  cornerSizeMobile?: string;
  corner?: string;
  strokeWidth?: string | number;
  className?: string;
  filter?: string;
  image?: string;
  overlay?: string;
  imagePosition?: string;
}

/**
 * React wrapper for the wm-shape custom element
 * This ensures the custom element is properly registered before rendering
 */
const WmShape: React.FC<WmShapeProps> = ({
  id,
  width,
  height,
  rounded,
  roundedMobile,
  cornerRounded,
  cornerRoundedMobile,
  cornerSize,
  cornerSizeMobile,
  corner,
  strokeWidth,
  className,
  filter,
  image,
  overlay,
  imagePosition,
  ...props
}) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check if custom element is registered
    if (typeof window !== "undefined" && !customElements.get("wm-shape")) {
      console.warn(
        "wm-shape custom element not registered. Make sure script.js is loaded."
      );
      return;
    }

    // Ensure the element is properly initialized
    if (elementRef.current) {
      // Force a re-render to ensure all attributes are set
      elementRef.current.setAttribute("data-initialized", "true");

      // Force the custom element to re-render if image changes
      if (image) {
        // Trigger a custom event to force re-render
        const event = new CustomEvent("wm-shape-update", {
          detail: { image, imagePosition },
        });
        elementRef.current.dispatchEvent(event);
      }
    }
  }, [image, id, imagePosition]);

  // Convert React props to HTML attributes
  const attributes: Record<string, string> = {};

  if (id) attributes.id = id;
  if (width) attributes.width = width.toString();
  if (height) attributes.height = height.toString();
  if (rounded) attributes.rounded = rounded;
  if (roundedMobile) attributes["rounded-mobile"] = roundedMobile;
  if (cornerRounded) attributes["corner-rounded"] = cornerRounded;
  if (cornerRoundedMobile)
    attributes["corner-rounded-mobile"] = cornerRoundedMobile;
  if (cornerSize) attributes["corner-size"] = cornerSize;
  if (cornerSizeMobile) attributes["corner-size-mobile"] = cornerSizeMobile;
  if (corner) attributes.corner = corner;
  if (strokeWidth) attributes["stroke-width"] = strokeWidth.toString();
  if (filter) attributes.filter = filter;
  if (image) attributes.image = image;
  if (overlay) attributes.overlay = overlay;
  if (imagePosition) attributes["image-position"] = imagePosition;

  return React.createElement("wm-shape", {
    ref: elementRef,
    className,
    ...attributes,
    ...props,
  });
};

export default WmShape;
