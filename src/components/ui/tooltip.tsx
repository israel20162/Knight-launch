import { type ReactElement } from "react";
import Tippy from "@tippyjs/react";
interface TooltipProps {
  text: string;
  children: ReactElement;
  placement?:
    | "top"
    | "top-end"
    | "top-start"
    | "bottom"
    | "bottom-end"
    | "bottom-start";
  className?:string
}
export const Tooltip = ({
  text,
  children,
  placement = "top",
  className
}: TooltipProps) => {
  return (
    <Tippy
      placement={placement}
      content={text}
      className={`bg-black text-white p-2 rounded text-xs ${className}`}
    >
      {children}
    </Tippy>
  );
};
