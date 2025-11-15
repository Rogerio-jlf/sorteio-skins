import { FiLoader } from "react-icons/fi";

// Componente ButtonLoader
interface ButtonLoaderProps {
  size?: number;
  className?: string;
}

export const ButtonLoader = ({
  size = 20,
  className = "",
}: ButtonLoaderProps) => {
  return <FiLoader size={size} className={`animate-spin ${className}`} />;
};

// Componente Button com Loading integrado
interface ButtonWithLoadingProps {
  isLoading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  loaderSize?: number;
}

export const ButtonWithLoading = ({
  isLoading = false,
  children,
  loadingText = "Carregando...",
  onClick,
  type = "button",
  disabled = false,
  className = "",
  loaderSize = 20,
}: ButtonWithLoadingProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <ButtonLoader size={loaderSize} />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
