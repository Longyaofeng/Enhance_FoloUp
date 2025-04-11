"use client";

import React, { useState, useContext, ReactNode, useEffect } from "react";
import { Interviewer } from "@/types/interviewer";
import { InterviewerService } from "@/services/interviewers.service";
import { useClerk } from "@clerk/nextjs";

interface InterviewerContextProps {
  interviewers: Interviewer[];
  setInterviewers: React.Dispatch<React.SetStateAction<Interviewer[]>>;
  createInterviewer: (payload: any) => void;
  deleteInterviewer: (interviewerId: bigint) => Promise<void>;
  interviewersLoading: boolean;
  setInterviewersLoading: (interviewersLoading: boolean) => void;
  refreshInterviewers: () => Promise<void>;
}

export const InterviewerContext = React.createContext<InterviewerContextProps>({
  interviewers: [],
  setInterviewers: () => {},
  createInterviewer: () => {},
  deleteInterviewer: async () => {},
  interviewersLoading: false,
  setInterviewersLoading: () => undefined,
  refreshInterviewers: async () => {},
});

interface InterviewerProviderProps {
  children: ReactNode;
}

export function InterviewerProvider({ children }: InterviewerProviderProps) {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const { user } = useClerk();
  const [interviewersLoading, setInterviewersLoading] = useState(true);

  const fetchInterviewers = async () => {
    try {
      setInterviewersLoading(true);
      const response = await InterviewerService.getAllInterviewers(
        user?.id as string,
      );
      setInterviewers(response);
    } catch (error) {
      console.error(error);
    }
    setInterviewersLoading(false);
  };

  const createInterviewer = async (payload: any) => {
    try {
      const result = await InterviewerService.createInterviewer({ ...payload });
      if (!result) {
        throw new Error('Failed to create interviewer');
      }
      await fetchInterviewers();
    } catch (error) {
      console.error('Error creating interviewer:', error);
      throw error;
    }
  };

  const deleteInterviewer = async (interviewerId: bigint) => {
    try {
      await InterviewerService.deleteInterviewer(interviewerId);
      await fetchInterviewers();
    } catch (error) {
      console.error('Error deleting interviewer:', error);
      throw error;
    }
  };

  const refreshInterviewers = async () => {
    await fetchInterviewers();
  };

  useEffect(() => {
    if (user?.id) {
      fetchInterviewers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <InterviewerContext.Provider
      value={{
        interviewers,
        setInterviewers,
        createInterviewer,
        deleteInterviewer,
        interviewersLoading,
        setInterviewersLoading,
        refreshInterviewers,
      }}
    >
      {children}
    </InterviewerContext.Provider>
  );
}

export const useInterviewers = () => {
  const value = useContext(InterviewerContext);

  return value;
};
