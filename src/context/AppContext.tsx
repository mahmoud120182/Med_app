
"use client";

import * as React from 'react';
import { mockBatches, mockMedications, mockPatients, mockRegimens, mockStations, type Batch, type Medication, type Patient, type RegimenDefinition, type Station, mockPatientCategories, type PatientCategory } from '@/lib/data';

type AppState = {
  patients: Patient[];
  archivedPatients: Patient[];
  medications: Medication[];
  batches: Batch[];
  regimens: RegimenDefinition[];
  stations: Station[];
  patientCategories: PatientCategory[];
}

type AppContextType = {
  patients: Patient[];
  setPatients: (setter: React.SetStateAction<Patient[]>) => void;
  archivedPatients: Patient[];
  setArchivedPatients: (setter: React.SetStateAction<Patient[]>) => void;
  medications: Medication[];
  setMedications: (setter: React.SetStateAction<Medication[]>) => void;
  batches: Batch[];
  setBatches: (setter: React.SetStateAction<Batch[]>) => void;
  regimens: RegimenDefinition[];
  setRegimens: (setter: React.SetStateAction<RegimenDefinition[]>) => void;
  stations: Station[];
  setStations: (setter: React.SetStateAction<Station[]>) => void;
  patientCategories: PatientCategory[];
  setPatientCategories: (setter: React.SetStateAction<PatientCategory[]>) => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  stationFilter: string;
  setStationFilter: React.Dispatch<React.SetStateAction<string>>;
  undoLastChange: () => void;
  canUndo: boolean;
  redoLastChange: () => void;
  canRedo: boolean;
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = React.useState<AppState>({
    patients: mockPatients,
    archivedPatients: [],
    medications: mockMedications,
    batches: mockBatches.sort((a,b) => a.expiryDate.getTime() - b.expiryDate.getTime()),
    regimens: mockRegimens,
    stations: mockStations,
    patientCategories: mockPatientCategories,
  });

  const [history, setHistory] = React.useState<AppState[]>([]);
  const [redoStack, setRedoStack] = React.useState<AppState[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [stationFilter, setStationFilter] = React.useState<string>('all');
  
  const updateState = (setter: (prevState: AppState) => AppState) => {
    setHistory(prevHistory => [...prevHistory, appState]);
    setRedoStack([]); // Clear redo stack on new action
    setAppState(setter);
  }

  const setPatients = (setter: React.SetStateAction<Patient[]>) => {
    updateState(prev => ({ ...prev, patients: typeof setter === 'function' ? setter(prev.patients) : setter }));
  };
  const setArchivedPatients = (setter: React.SetStateAction<Patient[]>) => {
    updateState(prev => ({ ...prev, archivedPatients: typeof setter === 'function' ? setter(prev.archivedPatients) : setter }));
  };
  const setMedications = (setter: React.SetStateAction<Medication[]>) => {
    updateState(prev => ({ ...prev, medications: typeof setter === 'function' ? setter(prev.medications) : setter }));
  };
  const setBatches = (setter: React.SetStateAction<Batch[]>) => {
    updateState(prev => ({ ...prev, batches: typeof setter === 'function' ? setter(prev.batches) : setter }));
  };
  const setRegimens = (setter: React.SetStateAction<RegimenDefinition[]>) => {
    updateState(prev => ({ ...prev, regimens: typeof setter === 'function' ? setter(prev.regimens) : setter }));
  };
  const setStations = (setter: React.SetStateAction<Station[]>) => {
    updateState(prev => ({ ...prev, stations: typeof setter === 'function' ? setter(prev.stations) : setter }));
  };
  const setPatientCategories = (setter: React.SetStateAction<PatientCategory[]>) => {
    updateState(prev => ({ ...prev, patientCategories: typeof setter === 'function' ? setter(prev.patientCategories) : setter }));
  };


  const undoLastChange = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setRedoStack(prev => [appState, ...prev]);
      setAppState(lastState);
      setHistory(prevHistory => prevHistory.slice(0, prevHistory.length - 1));
    }
  };

  const redoLastChange = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setHistory(prev => [...prev, appState]);
      setAppState(nextState);
      setRedoStack(prev => prev.slice(1));
    }
  };

  const value = {
    ...appState,
    setPatients,
    setArchivedPatients,
    setMedications,
    setBatches,
    setRegimens,
    setStations,
    setPatientCategories,
    searchTerm,
    setSearchTerm,
    stationFilter,
    setStationFilter,
    undoLastChange,
    canUndo: history.length > 0,
    redoLastChange,
    canRedo: redoStack.length > 0,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
