"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface CourseSidebarContextType {
  isCourseSidebarOpen: boolean;
  toggleCourseSidebar: () => void;
  lastUnlockedLesson: number;
  setLastUnlockedLesson: (lessonIndex: number) => void;
}

const CourseSidebarContext = createContext<CourseSidebarContextType | undefined>(undefined);

export const CourseSidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isCourseSidebarOpen, setCourseSidebarOpen] = useState(false);
  const [lastUnlockedLesson, setLastUnlockedLesson] = useState(0);

  const toggleCourseSidebar = () => {
    setCourseSidebarOpen(prev => !prev);
  };

  return (
    <CourseSidebarContext.Provider value={{ isCourseSidebarOpen, toggleCourseSidebar, lastUnlockedLesson, setLastUnlockedLesson }}>
      {children}
    </CourseSidebarContext.Provider>
  );
};

export const useCourseSidebar = () => {
  const context = useContext(CourseSidebarContext);
  if (context === undefined) {
    throw new Error('useCourseSidebar must be used within a CourseSidebarProvider');
  }
  return context;
};