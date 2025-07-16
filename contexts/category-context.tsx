
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type GlobalCategory = string | null;

interface CategoryContextType {
  selectedCategory: GlobalCategory;
  setSelectedCategory: (cat: GlobalCategory) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<GlobalCategory>(null);
  return (
    <CategoryContext.Provider value={{ selectedCategory, setSelectedCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategoryContext() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategoryContext must be used within a CategoryProvider");
  return ctx;
}
