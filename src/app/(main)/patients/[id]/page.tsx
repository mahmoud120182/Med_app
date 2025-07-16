

"use client";

import * as React from 'react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Archive, Trash2, Calendar as CalendarIcon, ChevronsUpDown, Check, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parse } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import type { Patient, MedicationRecord } from '@/lib/data';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';


type MedicationToRemove = {
  category: keyof Omit<Patient['medications'], 'depo' | 'solutions'>;
  medRecordId: string;
} | null;

const CreatableCombobox = ({
  items,
  value,
  onSelect,
  placeholder,
  searchPlaceholder,
  notFoundText,
  isCode = false,
  isName = false,
}: {
  items: { value: string, label: string }[];
  value: string;
  onSelect: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  notFoundText: string;
  isCode?: boolean;
  isName?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelect = (currentValue: string) => {
    const selectedItem = items.find(item => item.label.toLowerCase() === currentValue.toLowerCase());
    let finalValue = selectedItem ? selectedItem.label : currentValue;
    if (isCode) {
      finalValue = finalValue.toUpperCase();
    }
    onSelect(finalValue);
    setInputValue(finalValue);
    setOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let val = e.target.value;
    if (isCode) {
      val = val.toUpperCase();
    }
    setInputValue(val);
  };
  
  const handleBlur = () => {
     onSelect(inputValue);
  }

  const InputComponent = isName ? Textarea : Input;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
            <InputComponent
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onClick={() => setOpen(true)}
              placeholder={placeholder}
              className={cn("w-full h-10", isName && "h-auto min-h-10")}
              dir={isName ? "rtl" : "ltr"}
            />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command filter={(value, search) => {
          if(value.toLowerCase().includes(search.toLowerCase())) return 1;
          return 0;
        }}>
          <CommandInput 
            placeholder={searchPlaceholder} 
          />
          <CommandList>
            <CommandEmpty>{notFoundText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.label ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};


const RegimenCombobox = ({
  medRecord,
  onUpdate
}: {
  medRecord: MedicationRecord;
  onUpdate: (medRecordId: string, field: keyof MedicationRecord, value: any) => void;
}) => {
    const { regimens: allRegimens } = useAppContext();
    const [codePopoverOpen, setCodePopoverOpen] = React.useState(false);
    const [meaningPopoverOpen, setMeaningPopoverOpen] = React.useState(false);

    const regimenCodeItems = React.useMemo(() => {
        const uniqueCodes = Array.from(new Set(allRegimens.map(reg => reg.code)));
        return uniqueCodes.map(code => ({ value: code, label: code }));
    }, [allRegimens]);

    const meaningsForCurrentCode = React.useMemo(() => {
        return allRegimens
            .filter(r => r.code.toLowerCase() === medRecord.regimen.toLowerCase())
            .map(r => ({ value: r.meaning, label: r.meaning }));
    }, [allRegimens, medRecord.regimen]);
    
    const [currentMeaning, setCurrentMeaning] = React.useState(medRecord.regimenMeaning || '');
    React.useEffect(() => {
        setCurrentMeaning(medRecord.regimenMeaning || '');
    }, [medRecord.regimenMeaning]);

    const handleCodeSelect = (code: string) => {
        onUpdate(medRecord.id, 'regimen', code.toUpperCase());
        const existingMeanings = allRegimens.filter(r => r.code.toLowerCase() === code.toLowerCase());
        if (existingMeanings.length > 0) {
            onUpdate(medRecord.id, 'regimenMeaning', existingMeanings[0].meaning);
        } else {
            onUpdate(medRecord.id, 'regimenMeaning', '');
        }
        setCodePopoverOpen(false);
    };
    
    const handleMeaningSelect = (meaning: string) => {
        onUpdate(medRecord.id, 'regimenMeaning', meaning);
        setCurrentMeaning(meaning);
        setMeaningPopoverOpen(false);
    };
    
    const handleMeaningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMeaning(e.target.value);
    }
    
    const handleMeaningBlur = () => {
        onUpdate(medRecord.id, 'regimenMeaning', currentMeaning);
    }


    return (
        <div className="flex flex-col gap-1">
            <Popover open={codePopoverOpen} onOpenChange={setCodePopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={codePopoverOpen}
                        className="w-full justify-between font-normal h-10"
                    >
                        {medRecord.regimen ? medRecord.regimen : 'Select code...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command
                        filter={(value, search) => value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0}
                    >
                        <CommandInput 
                            placeholder="Search or type code..." 
                            value={medRecord.regimen}
                            onValueChange={(value) => onUpdate(medRecord.id, 'regimen', value.toUpperCase())}
                        />
                        <CommandList>
                            <CommandEmpty>No regimen found.</CommandEmpty>
                            <CommandGroup>
                                {regimenCodeItems.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.value}
                                        onSelect={handleCodeSelect}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", medRecord.regimen === item.value ? "opacity-100" : "opacity-0")} />
                                        {item.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {meaningsForCurrentCode.length > 1 ? (
                <Popover open={meaningPopoverOpen} onOpenChange={setMeaningPopoverOpen}>
                    <PopoverTrigger asChild>
                         <Button
                            variant="outline"
                            role="combobox"
                            dir="rtl"
                            aria-expanded={meaningPopoverOpen}
                            className="w-full justify-between font-normal mt-1 h-10"
                        >
                            {medRecord.regimenMeaning || 'Select meaning...'}
                            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Search meaning..." />
                            <CommandList>
                                <CommandEmpty>No meaning found.</CommandEmpty>
                                <CommandGroup>
                                {meaningsForCurrentCode.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.value}
                                        onSelect={handleMeaningSelect}
                                        dir="rtl"
                                    >
                                        <Check className={cn("ml-2 h-4 w-4", medRecord.regimenMeaning === item.value ? "opacity-100" : "opacity-0")} />
                                        {item.label}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            ) : (
                <Input 
                    className="h-10 mt-1"
                    dir="rtl"
                    placeholder="Enter meaning..."
                    value={currentMeaning}
                    onChange={handleMeaningChange}
                    onBlur={handleMeaningBlur}
                />
            )}
        </div>
    );
};


export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { patients, setPatients, setArchivedPatients, medications: allMedications, batches: allBatches, setStationFilter, patientCategories, setPatientCategories } = useAppContext();
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  
  const [patientToArchive, setPatientToArchive] = React.useState<Patient | null>(null);
  const [medicationToRemove, setMedicationToRemove] = React.useState<MedicationToRemove>(null);

  const patientId = typeof params.id === 'string' ? params.id : undefined;
  const patient = patients.find(p => p.id === patientId);
  
  const [isCategoryPopoverOpen, setCategoryPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    if (!patient && patientId) {
    }
  }, [patient, patientId, router]);

  const showSavedToast = React.useCallback(() => {
    toast({ title: "Saved", description: "Your changes have been saved." });
  }, [toast]);

  const handlePatientCategoryChange = (categoryId: string, selected: boolean) => {
    setPatients(prevPatients => prevPatients.map(p => {
        if (p.id === patientId) {
            const currentCategoryIds = p.categoryIds || [];
            const newCategoryIds = selected
                ? [...currentCategoryIds, categoryId]
                : currentCategoryIds.filter(id => id !== categoryId);
            return { ...p, categoryIds: newCategoryIds };
        }
        return p;
    }));
    showSavedToast();
  };


  const handleArchivePatient = () => {
    if (!patientToArchive) return;
    setArchivedPatients(prev => {
      if (prev.some(p => p.id === patientToArchive.id)) {
        return prev;
      }
      return [...prev, patientToArchive];
    });
    setPatients(prevPatients => prevPatients.filter(p => p.id !== patientToArchive.id));
    toast({
        title: "Patient Archived",
        description: `Patient ${patientToArchive.name} (M.R. ${patientToArchive.id}) has been archived.`,
    });
    setPatientToArchive(null);
    router.push('/patients');
  };
  
  const handleTableKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const { key } = e;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab'].includes(key)) return;
    
    const target = e.currentTarget;
    const table = target.closest('table');
    if (!table) return;

    const allInputs = Array.from(table.querySelectorAll('input, textarea, button[role="combobox"]')) as HTMLElement[];
    const currentIndex = allInputs.indexOf(target);
    if (currentIndex === -1) return;
    
    e.preventDefault();

    let nextIndex = -1;

    if (key === 'ArrowLeft') {
        if (currentIndex > 0) nextIndex = currentIndex - 1;
    } else if (key === 'ArrowRight' || key === 'Enter' || key === 'Tab') {
        if (currentIndex < allInputs.length - 1) nextIndex = currentIndex + 1;
    } else if (key === 'ArrowUp' || key === 'ArrowDown') {
        const row = target.closest('tr');
        if (!row) return;

        let currentCellIndex = -1;
        const cells = Array.from(row.children) as HTMLTableCellElement[];
        for(let i=0; i<cells.length; i++){
          if(cells[i].contains(target)){
            currentCellIndex = i;
            break;
          }
        }
        if(currentCellIndex === -1) return;

        const targetRow = key === 'ArrowUp' 
            ? row.previousElementSibling as HTMLTableRowElement 
            : row.nextElementSibling as HTMLTableRowElement;
        
        if(targetRow) {
            const targetCell = targetRow.children[currentCellIndex] as HTMLElement;
            if(targetCell){
              const nextInput = targetCell.querySelector('input, textarea, button[role="combobox"]') as HTMLElement | null;
              if(nextInput){
                nextInput.focus();
                if (nextInput instanceof HTMLInputElement || nextInput instanceof HTMLTextAreaElement) {
                  nextInput.select();
                }
                return;
              }
            }
        }
    }

    if (nextIndex !== -1) {
        const nextElement = allInputs[nextIndex];
        if (nextElement) {
            nextElement.focus();
            if (nextElement instanceof HTMLInputElement || nextElement instanceof HTMLTextAreaElement) {
                nextElement.select();
            }
        }
    }
  };

  const handleAddMedicationRow = (category: keyof Omit<Patient['medications'], 'solutions' | 'depo'>) => {
    setPatients(prevPatients =>
      prevPatients.map(p => {
        if (p.id === patientId) {
          const newMedication: MedicationRecord = {
            id: `REC-NEW-${Date.now()}`,
            medicationCode: '',
            medicationName: '',
            dose: '',
            regimen: '',
            notes: '',
            batchId: '',
            expiryDate: null,
          };
          const updatedMedications = {
            ...p.medications,
            [category]: [newMedication, ...p.medications[category]],
          };
          return { ...p, medications: updatedMedications };
        }
        return p;
      })
    );
  };
  
  const handleAddDepoRow = () => {
    setPatients(prevPatients =>
        prevPatients.map(p => {
            if (p.id === patientId) {
                const newDepoMedication: MedicationRecord = {
                    id: `REC-NEW-${Date.now()}`,
                    medicationCode: '',
                    medicationName: '',
                    dose: '',
                    regimen: '',
                    notes: '',
                    batchId: '',
                    expiryDate: null,
                    notify: false,
                    notificationStartDate: null,
                    notificationFrequencyValue: '',
                    notificationFrequencyUnit: 'weeks',
                };
                const updatedMedications = {
                    ...p.medications,
                    depo: [newDepoMedication, ...p.medications.depo],
                };
                return { ...p, medications: updatedMedications };
            }
            return p;
        })
    );
  };

  const handleConfirmRemoveMedicationRow = () => {
    if (!medicationToRemove) return;
    const { category, medRecordId } = medicationToRemove;
    setPatients(prevPatients =>
      prevPatients.map(p => {
        if (p.id === patientId) {
          const updatedMedications = {
            ...p.medications,
            [category]: p.medications[category].filter(med => med.id !== medRecordId),
          };
          return { ...p, medications: updatedMedications };
        }
        return p;
      })
    );
    toast({ variant: "destructive", title: "Medication Removed", description: "The medication record has been removed."});
    setMedicationToRemove(null);
  };
  
  const handleMedicationRecordUpdate = (
    category: keyof Omit<Patient['medications'], 'solutions'>,
    medRecordId: string,
    field: keyof MedicationRecord,
    value: string | boolean | number | Date | null
  ) => {
    
    setPatients(prevPatients =>
      prevPatients.map(p => {
        if (p.id === patientId) {
          let newMedicationsForCategory = p.medications[category].map(med => {
              if (med.id === medRecordId) {
                let updatedMed: MedicationRecord = { ...med, [field]: value };
                
                if (field === 'medicationCode' && typeof value === 'string') {
                    updatedMed.medicationCode = value.toUpperCase();
                    const matchedMedication = allMedications.find(m => m.code.toLowerCase() === value.toLowerCase());
                    if (matchedMedication) {
                        updatedMed.medicationName = matchedMedication.name;
                    }
                    
                    const now = new Date();
                    const suitableBatch = allBatches
                        .filter(b => b.medicationCode.toLowerCase() === value.toLowerCase() && b.expiryDate > now)
                        .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
                        [0];

                    if (suitableBatch) {
                        updatedMed.batchId = suitableBatch.batchId;
                        updatedMed.expiryDate = suitableBatch.expiryDate;
                    } else {
                        updatedMed.batchId = 'N/A';
                        updatedMed.expiryDate = null;
                    }
                }
                
                if (field === 'medicationName' && typeof value === 'string') {
                    const matchedMedication = allMedications.find(m => m.name.toLowerCase() === value.toLowerCase());
                    if (matchedMedication && updatedMed.medicationCode !== matchedMedication.code) {
                        updatedMed.medicationCode = matchedMedication.code;
                         const now = new Date();
                        const suitableBatch = allBatches
                            .filter(b => b.medicationCode.toLowerCase() === matchedMedication.code.toLowerCase() && b.expiryDate > now)
                            .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
                            [0];

                        if (suitableBatch) {
                            updatedMed.batchId = suitableBatch.batchId;
                            updatedMed.expiryDate = suitableBatch.expiryDate;
                        } else {
                            updatedMed.batchId = 'N/A';
                            updatedMed.expiryDate = null;
                        }
                    }
                }


                if (field === 'notificationStartDate') {
                    setIsCalendarOpen(false); // Close calendar on select
                }
                
                return updatedMed;
              }
              return med;
            });

          if (field === 'medicationCode') {
            const allMedsForCategory = newMedicationsForCategory;
            const isDuplicate = allMedsForCategory.some(
              (m) => m.id !== medRecordId && m.medicationCode.toLowerCase() === value && value !== ''
            );

            if (isDuplicate) {
              toast({
                title: "Duplicate Medication",
                description: `This medication now appears multiple times in this list.`
              });
               newMedicationsForCategory.sort((a, b) => {
                  if (a.medicationCode.toLowerCase() === value) return -1;
                  if (b.medicationCode.toLowerCase() === value) return 1;
                  return a.medicationCode.localeCompare(b.medicationCode);
                });
            } else {
              newMedicationsForCategory.sort((a, b) => a.medicationCode.localeCompare(b.medicationCode));
            }
          }

          const updatedMedications = {
            ...p.medications,
            [category]: newMedicationsForCategory
          };
          return { ...p, medications: updatedMedications };
        }
        return p;
      })
    );
     showSavedToast();
  };
  
  const handleBoxRecordUpdate = React.useCallback((
    boxRecordId: string,
    field: keyof BoxRecord,
    value: string
  ) => {
    setPatients(prevPatients =>
      prevPatients.map(p => {
        if (p.id === patientId) {
          const updatedBoxes = p.boxes.map(box => {
            if (box.id === boxRecordId) {
              return { ...box, [field]: value };
            }
            return box;
          });
          return { ...p, boxes: updatedBoxes };
        }
        return p;
      })
    );
    showSavedToast();
  }, [setPatients, patientId, showSavedToast]);

  const handleStationClick = (stationName: string) => {
    setStationFilter(stationName);
    router.push('/patients');
  }
  
  const medicationCodeComboboxItems = React.useMemo(() => allMedications.map(med => ({
    value: med.code,
    label: `${med.code} - ${med.name}`,
  })), [allMedications]);
  
  const medicationNameComboboxItems = React.useMemo(() => allMedications.map(med => ({
    value: med.name,
    label: `${med.name} (${med.code})`,
  })), [allMedications]);

  const renderMedicationTable = (medications: MedicationRecord[], category: keyof Omit<Patient['medications'], 'solutions' | 'depo'>, title: string, description: string) => (
     <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
                <Button size="sm" variant="outline" onClick={() => handleAddMedicationRow(category)}>
                    Add
                </Button>
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap w-[15%]">Medication Code</TableHead>
                  <TableHead className="whitespace-nowrap w-[40%]">Medication Name</TableHead>
                  <TableHead className="whitespace-nowrap w-[5%]">Dose</TableHead>
                  <TableHead className="whitespace-nowrap w-[15%]">Regimen</TableHead>
                  <TableHead className="whitespace-nowrap w-[15%]">Notes</TableHead>
                  <TableHead className="whitespace-nowrap w-[5%]">Batch</TableHead>
                  <TableHead className="whitespace-nowrap w-[5%]">Expiry</TableHead>
                  <TableHead className="text-right whitespace-nowrap w-[5%]"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.length > 0 ? medications.map(med => (
                  <TableRow key={med.id}>
                    <TableCell className="whitespace-nowrap">
                       <CreatableCombobox 
                        isCode={true}
                        items={medicationCodeComboboxItems}
                        value={med.medicationCode}
                        onSelect={(value) => handleMedicationRecordUpdate(category, med.id, 'medicationCode', value.toUpperCase().split(' - ')[0])}
                        placeholder="Select or type code..."
                        searchPlaceholder="Search medication code..."
                        notFoundText="No medication found."
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                         <CreatableCombobox 
                          isName={true}
                          items={medicationNameComboboxItems}
                          value={med.medicationName}
                          onSelect={(value) => {
                              const labelPart = value.split(' (')[0];
                              const selectedMed = allMedications.find(m => m.name.toLowerCase() === labelPart.toLowerCase());
                              handleMedicationRecordUpdate(category, med.id, 'medicationName', selectedMed ? selectedMed.name : value)
                          }}
                          placeholder="Select or type name..."
                          searchPlaceholder="Search medication name..."
                          notFoundText="No medication found."
                        />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Input className="h-10 w-16" onKeyDown={handleTableKeyDown} defaultValue={med.dose} onBlur={(e) => handleMedicationRecordUpdate(category, med.id, 'dose', e.target.value)} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap w-[250px]">
                       <RegimenCombobox 
                         medRecord={med}
                         onUpdate={(medRecordId, field, value) => handleMedicationRecordUpdate(category, medRecordId, field, value)}
                       />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Textarea dir="rtl" className="h-10" onKeyDown={handleTableKeyDown} defaultValue={med.notes} onBlur={(e) => handleMedicationRecordUpdate(category, med.id, 'notes', e.target.value)} />
                    </TableCell>
                     <TableCell className="whitespace-nowrap">
                      <Input className="h-10 font-mono text-xs w-[80px]" onKeyDown={handleTableKeyDown} defaultValue={med.batchId} onBlur={(e) => handleMedicationRecordUpdate(category, med.id, 'batchId', e.target.value)} />
                    </TableCell>
                     <TableCell className="text-xs whitespace-nowrap">
                      {med.expiryDate ? format(med.expiryDate, 'dd/MM/yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setMedicationToRemove({ category, medRecordId: med.id })}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                        </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">No medications found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
    </Card>
  );

  if (!patient) {
     if (patientId) {
        return null;
    }
    notFound();
  }

  const { regular, daily, depo } = patient.medications;
  const { boxes } = patient;
  
  const patientCategoryNames = patient.categoryIds.map(id => patientCategories.find(c => c.id === id)?.name).filter(Boolean);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-4 relative">
        <Button variant="outline" size="icon" className="h-7 w-7 absolute left-0 top-1/2 -translate-y-1/2" asChild>
          <Link href="/patients">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex-1 text-center" dir="rtl">
          <h1 className="text-2xl font-bold tracking-tight">
            {patient.name}
          </h1>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap" dir="ltr">
            <span>M.R.: {patient.id}</span>
            <span>&bull;</span>
            <button onClick={() => handleStationClick(patient.station)} className="hover:underline">
              Station: {patient.station}
            </button>
             {patientCategoryNames.length > 0 && <span>&bull;</span>}
            <div className="flex items-center gap-1 flex-wrap">
              {patientCategoryNames.map(name => <Badge key={name} variant="secondary">{name}</Badge>)}
               <Popover open={isCategoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6">Edit Categories</Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Command>
                      <CommandInput placeholder="Filter categories..."/>
                      <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
                        <CommandGroup>
                          {patientCategories.map(category => (
                            <CommandItem
                                key={category.id}
                                onSelect={() => handlePatientCategoryChange(category.id, !patient.categoryIds.includes(category.id))}
                                className="flex items-center gap-2"
                            >
                               <Checkbox checked={patient.categoryIds.includes(category.id)} />
                               <span>{category.name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                </PopoverContent>
               </Popover>
            </div>
          </div>
          {patient.specialNotes && (
            <p className="text-sm text-destructive mt-1" dir="rtl">{patient.specialNotes}</p>
          )}
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPatientToArchive(patient)}>
            <Archive className="h-4 w-4 mr-2" />
            Archive Patient
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {renderMedicationTable(regular, 'regular', 'Regular Medications', 'Scheduled medications taken on a regular basis.')}
        {renderMedicationTable(daily, 'daily', 'Daily Medications', 'Medications taken every day.')}
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button size="sm" variant="outline" onClick={handleAddDepoRow}>
                        Add
                    </Button>
                    <div>
                        <CardTitle>Depo Medications</CardTitle>
                        <CardDescription>Long-acting injectable medications.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap w-[15%]">Medication Code</TableHead>
                          <TableHead className="whitespace-nowrap w-[25%]">Medication Name</TableHead>
                          <TableHead className="whitespace-nowrap w-[5%]">Dose</TableHead>
                          <TableHead className="whitespace-nowrap w-[15%]">Regimen</TableHead>
                          <TableHead className="whitespace-nowrap w-[10%]">Notes</TableHead>
                          <TableHead className="whitespace-nowrap w-[5%]">Batch</TableHead>
                          <TableHead className="whitespace-nowrap w-[5%]">Expiry</TableHead>
                          <TableHead className="whitespace-nowrap w-[5%]">Notify</TableHead>
                          <TableHead className="whitespace-nowrap w-[10%]">Notify Start Date</TableHead>
                          <TableHead className="whitespace-nowrap w-[10%]">Frequency</TableHead>
                          <TableHead className="text-right whitespace-nowrap w-[5%]"><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {depo.length > 0 ? depo.map(med => (
                            <TableRow key={med.id}>
                                <TableCell className="whitespace-nowrap">
                                   <CreatableCombobox 
                                    isCode={true}
                                    items={medicationCodeComboboxItems}
                                    value={med.medicationCode}
                                    onSelect={(value) => handleMedicationRecordUpdate('depo', med.id, 'medicationCode', value.toUpperCase().split(' - ')[0])}
                                    placeholder="Select or type code..."
                                    searchPlaceholder="Search medication code..."
                                    notFoundText="No medication found."
                                  />
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                   <CreatableCombobox
                                    isName={true}
                                    items={medicationNameComboboxItems}
                                    value={med.medicationName}
                                    onSelect={(value) => {
                                        const labelPart = value.split(' (')[0];
                                        const selectedMed = allMedications.find(m => m.name.toLowerCase() === labelPart.toLowerCase());
                                        handleMedicationRecordUpdate('depo', med.id, 'medicationName', selectedMed ? selectedMed.name : value)
                                    }}
                                    placeholder="Select or type name..."
                                    searchPlaceholder="Search medication name..."
                                    notFoundText="No medication found."
                                  />
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <Input className="h-10 w-16" onKeyDown={handleTableKeyDown} defaultValue={med.dose} onBlur={(e) => handleMedicationRecordUpdate('depo', med.id, 'dose', e.target.value)} />
                                </TableCell>
                                <TableCell className="whitespace-nowrap w-[250px]">
                                   <RegimenCombobox 
                                     medRecord={med}
                                     onUpdate={(medRecordId, field, value) => handleMedicationRecordUpdate('depo', medRecordId, field, value)}
                                   />
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <Textarea dir="rtl" className="h-10" onKeyDown={handleTableKeyDown} defaultValue={med.notes} onBlur={(e) => handleMedicationRecordUpdate('depo', med.id, 'notes', e.target.value)} />
                                </TableCell>
                                 <TableCell className="whitespace-nowrap">
                                  <Input className="h-10 font-mono text-xs w-[80px]" onKeyDown={handleTableKeyDown} defaultValue={med.batchId} onBlur={(e) => handleMedicationRecordUpdate('depo', med.id, 'batchId', e.target.value)} />
                                </TableCell>
                                 <TableCell className="text-xs whitespace-nowrap">
                                  {med.expiryDate ? format(med.expiryDate, 'dd/MM/yyyy') : 'N/A'}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <Checkbox
                                        checked={med.notify}
                                        onCheckedChange={(checked) => handleMedicationRecordUpdate('depo', med.id, 'notify', checked as boolean)}
                                    />
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant={"outline"}
                                          disabled={!med.notify}
                                          className={cn(
                                            "w-[180px] justify-start text-left font-normal h-10",
                                            !med.notificationStartDate && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {med.notificationStartDate ? format(med.notificationStartDate, "dd/MM/yyyy") : <span>Pick a date</span>}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0">
                                        <Calendar
                                          mode="single"
                                          selected={med.notificationStartDate ?? undefined}
                                          onSelect={(date) => handleMedicationRecordUpdate('depo', med.id, 'notificationStartDate', date || null)}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <Input
                                      disabled={!med.notify}
                                      type="number"
                                      defaultValue={med.notificationFrequencyValue}
                                      className="h-10 w-16 disabled:cursor-not-allowed disabled:opacity-50"
                                      onKeyDown={handleTableKeyDown}
                                      onBlur={(e) => handleMedicationRecordUpdate('depo', med.id, 'notificationFrequencyValue', e.target.value)}
                                    />
                                    <Select
                                      disabled={!med.notify}
                                      value={med.notificationFrequencyUnit}
                                      onValueChange={(value) => handleMedicationRecordUpdate('depo', med.id, 'notificationFrequencyUnit', value)}
                                    >
                                      <SelectTrigger className="h-10 w-24 disabled:cursor-not-allowed disabled:opacity-50" onKeyDown={handleTableKeyDown}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="days">Days</SelectItem>
                                        <SelectItem value="weeks">Weeks</SelectItem>
                                        <SelectItem value="months">Months</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => setMedicationToRemove({ category: 'depo', medRecordId: med.id })}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={11} className="h-24 text-center">No medications found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Medication Boxes</CardTitle>
                <CardDescription>Packed medication compliance aids.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="whitespace-nowrap">Box ID</TableHead>
                    <TableHead className="whitespace-nowrap">Cycle</TableHead>
                    <TableHead className="whitespace-nowrap">Pack Date</TableHead>
                    <TableHead className="whitespace-nowrap">Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {boxes.length > 0 ? boxes.map(box => (
                    <TableRow key={box.id}>
                        <TableCell className="font-mono whitespace-nowrap">{box.boxId}</TableCell>
                        <TableCell className="whitespace-nowrap">{box.cycle}</TableCell>
                        <TableCell className="whitespace-nowrap">{format(box.packDate, 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="whitespace-nowrap">
                        <Textarea dir="rtl" className="h-10" onKeyDown={handleTableKeyDown} defaultValue={box.notes} onBlur={(e) => handleBoxRecordUpdate(box.id, 'notes', e.target.value)} />
                        </TableCell>
                    </TableRow>
                    )) : (
                        <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">No medication boxes found.</TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!patientToArchive} onOpenChange={(open) => {if (!open) setPatientToArchive(null)}}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this patient?</AlertDialogTitle>
            <AlertDialogDescription>
                This action will move the patient record for <span className="font-medium">{patientToArchive?.name} ({patientToArchive?.id})</span> to the archives. You can restore them later.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleArchivePatient}
            >
                Archive Patient
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!medicationToRemove} onOpenChange={(open) => {if (!open) setMedicationToRemove(null)}}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action will remove this medication record from the patient's file. This cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleConfirmRemoveMedicationRow}
            >
                Remove Medication
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

