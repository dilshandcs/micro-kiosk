import { createContext, useContext, useMemo, useState } from "react";

interface HeaderContextType {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  showBack: boolean;
  setShowBack: React.Dispatch<React.SetStateAction<boolean>>;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("");
  const [showBack, setShowBack] = useState(false);

  const headerValues = useMemo(
    () => ({
      title,
      setTitle,
      showBack,
      setShowBack,
    }),
    [title, setTitle, showBack, setShowBack]
  );

  return (
    <HeaderContext.Provider value={headerValues}>
      {children}
    </HeaderContext.Provider>
  );
}

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) throw new Error("useHeader must be used within HeaderProvider");
  return context;
};
