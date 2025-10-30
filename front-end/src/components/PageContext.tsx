import { createContext, useContext, useState, ReactNode } from "react";

type Page = 'home' | 'm_studyroom' | 'mypage' | 'popup' | 'login';

interface PageContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <PageContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (!context) throw new Error("usePage must be used within PageProvider");
  return context;
}
