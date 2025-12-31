import type { ButtonHTMLAttributes } from "react";

export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 ${className ?? ""}`}
    />
  );
}
