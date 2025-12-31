import type { ButtonHTMLAttributes } from "react";

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:bg-gray-400 ${className ?? ""}`}
    />
  );
}
