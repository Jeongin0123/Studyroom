import { createContext, useContext, useState, ReactNode } from "react";

type Page = 'home' | 'm_studyroom' | 'mypage' | 'popup' | 'login' | 'studyroom';

interface PageContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
  const savedPage = sessionStorage.getItem("currentPage") as Page | null;
  return savedPage ? savedPage : 'home';
});

  const handleSetCurrentPage = (page: Page) => {
    setCurrentPage(page);
    sessionStorage.setItem("currentPage", page);
  };

  return (
    <PageContext.Provider value={{ currentPage, setCurrentPage: handleSetCurrentPage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (!context) throw new Error("usePage must be used within PageProvider");
  return context;
}
