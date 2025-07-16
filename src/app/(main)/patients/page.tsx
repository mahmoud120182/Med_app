

"use client";

import * as React from 'react';
import Link from 'next/link';
import { MoreHorizontal, PlusCircle, X, ArrowUpDown } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Patient } from '@/lib/data';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { SearchResults } from '../search-results';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type SortConfig = {
    key: keyof Patient;
    direction: 'ascending' | 'descending';
};

export default function PatientsPage() {
  const { patients, setPatients, searchTerm, stations, archivedPatients, setArchivedPatients, stationFilter, setStationFilter, patientCategories } = useAppContext();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [patientToArchive, setPatientToArchive] = React.useState<Patient | null>(null);
  const [patientToRestoreFromArchive, setPatientToRestoreFromArchive] = React.useState<Patient | null>(null);
  const { toast } = useToast();
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null);

  const [formState, setFormState] = React.useState({
    id: '',
    name: '',
    station: '',
    specialNotes: '',
  });
  
  const requestSort = (key: keyof Patient) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedPatients = React.useMemo(() => {
    let sortablePatients = [...patients];
    if (sortConfig !== null) {
      sortablePatients.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortablePatients;
  }, [patients, sortConfig]);

  const filteredPatients = React.useMemo(() => {
    return sortedPatients
      .filter(patient => stationFilter === 'all' || patient.station === stationFilter)
  }, [sortedPatients, stationFilter]);


  if (searchTerm) {
    return <SearchResults />;
  }
  
  const showSavedToast = React.useCallback(() => {
    toast({ title: "Saved", description: "Your changes have been saved." });
  }, [toast]);

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

  const handleArchivePatient = () => {
    if (!patientToArchive) return;

    // Prevent adding a duplicate if it already exists
    if (!archivedPatients.some(p => p.id === patientToArchive.id)) {
      setArchivedPatients(prev => [...prev, patientToArchive]);
    }
    setPatients(prevPatients => prevPatients.filter(p => p.id !== patientToArchive.id));
    toast({
        title: "Patient Archived",
        description: `Patient ${patientToArchive.name} (M.R. ${patientToArchive.id}) has been moved to archives.`,
    });
    setPatientToArchive(null);
  };

  const handleOpenSheet = () => {
    setFormState({ id: '', name: '', station: '', specialNotes: '' });
    setIsSheetOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({...prev, [id]: value}));
  };

  const handleStationChange = (value: string) => {
    setFormState(prev => ({ ...prev, station: value }));
  };
  
  const handlePatientUpdate = React.useCallback((id: string, field: 'name' | 'station' | 'specialNotes', value: string) => {
    setPatients(prevPatients => 
      prevPatients.map(p => p.id === id ? {...p, [field]: value} : p)
    );
    showSavedToast();
  }, [setPatients, showSavedToast]);

  const handleSavePatient = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!formState.id) {
        toast({ variant: "destructive", title: "Missing Information", description: "Patient M.R. is a required field." });
        return;
      }
      
      // Check for active patients
      if (patients.some(p => p.id.toLowerCase() === formState.id.toLowerCase())) {
        toast({ variant: "destructive", title: "Duplicate M.R.", description: "A patient with this M.R. already exists in the active list." });
        return;
      }

      // Check for archived patients
      const archivedMatch = archivedPatients.find(p => p.id.toLowerCase() === formState.id.toLowerCase());
      if (archivedMatch) {
          setPatientToRestoreFromArchive(archivedMatch);
          return; 
      }
      
      const newPatient: Patient = {
        ...formState,
        categoryIds: [],
        medications: { regular: [], daily: [], depo: [] },
        boxes: [],
      };
      setPatients(prev => [...prev, newPatient]);
      toast({ title: "Patient Added", description: `M.R. ${formState.id} has been created.` });
    
    setIsSheetOpen(false);
  }

  const handleRestoreArchivedPatient = () => {
    if (!patientToRestoreFromArchive) return;

    setPatients(prev => {
        // Prevent adding a duplicate if it already exists
        if (prev.some(p => p.id === patientToRestoreFromArchive.id)) {
            return prev;
        }
        return [...prev, patientToRestoreFromArchive];
    });

    setArchivedPatients(prev => prev.filter(p => p.id !== patientToRestoreFromArchive.id));
    
    toast({
        title: "Patient Restored",
        description: `Patient ${patientToRestoreFromArchive.name} (M.R. ${patientToRestoreFromArchive.id}) has been restored from archives.`,
    });

    setPatientToRestoreFromArchive(null);
    setIsSheetOpen(false);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Patients</CardTitle>
            <CardDescription>Manage your patient M.R.s.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by station..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {stations.map(station => (
                        <SelectItem key={station.id} value={station.name}>
                            {station.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
             {stationFilter !== 'all' && (
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setStationFilter('all')}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear filter</span>
                </Button>
            )}
            <Button size="sm" className="gap-1" onClick={handleOpenSheet}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Patient M.R.</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap w-[12ch]">
                <Button variant="ghost" onClick={() => requestSort('id')}>
                  M.R.
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="whitespace-nowrap w-full">
                 <Button variant="ghost" onClick={() => requestSort('name')}>
                  Patient Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="whitespace-nowrap w-[12ch]">
                <Button variant="ghost" onClick={() => requestSort('station')}>
                  Station
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>ملاحظات خاصة بالمريض</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map(patient => (
              <TableRow key={patient.id}>
                <TableCell className="font-mono whitespace-nowrap">
                   <Link href={`/patients/${patient.id}`} className="hover:underline">
                    {patient.id}
                   </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap w-full">
                   <Input 
                    dir="rtl"
                    defaultValue={patient.name}
                    className="h-auto bg-transparent border-transparent hover:border-input p-1"
                    onKeyDown={handleTableKeyDown}
                    onBlur={(e) => handlePatientUpdate(patient.id, 'name', e.target.value)}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap w-[5ch]">
                  <Select value={patient.station} onValueChange={(value) => handlePatientUpdate(patient.id, 'station', value)}>
                    <SelectTrigger onKeyDown={handleTableKeyDown} className="w-auto border-transparent bg-transparent hover:border-input p-1 [&_svg]:hidden">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {stations.map(station => (
                            <SelectItem key={station.id} value={station.name}>
                                {station.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                 <TableCell>
                  {patient.categoryIds.map(id => patientCategories.find(c => c.id === id)?.name).join(', ')}
                </TableCell>
                <TableCell>
                    <Textarea
                        defaultValue={patient.specialNotes}
                        dir="rtl"
                        className="h-auto bg-transparent border-transparent hover:border-input p-1 min-h-10"
                        onKeyDown={handleTableKeyDown}
                        onBlur={(e) => handlePatientUpdate(patient.id, 'specialNotes', e.target.value)}
                    />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                       <DropdownMenuItem asChild>
                        <Link href={`/patients/${patient.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setPatientToArchive(patient)}>Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[600px]">
          <form onSubmit={handleSavePatient}>
            <SheetHeader>
              <SheetTitle>Add Patient M.R.</SheetTitle>
              <SheetDescription>
                Fill in the details below to add a new patient M.R.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id" className="text-right">M.R.</Label>
                <Input id="id" placeholder="e.g. 123456" type="number" value={formState.id} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Patient Name</Label>
                <Input id="name" dir="rtl" placeholder="سارة لي" value={formState.name} onChange={handleFormChange} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="station" className="text-right">Station</Label>
                <Select value={formState.station} onValueChange={handleStationChange}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a station" />
                  </SelectTrigger>
                  <SelectContent>
                      {stations.map(station => (
                          <SelectItem key={station.id} value={station.name}>
                              {station.name}
                          </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialNotes" className="text-right">Special Notes</Label>
                <Textarea id="specialNotes" dir="rtl" placeholder="أضف ملاحظات خاصة..." value={formState.specialNotes} onChange={handleFormChange} className="col-span-3" />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit">Save Record</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <AlertDialog open={!!patientToArchive} onOpenChange={(open) => {if (!open) setPatientToArchive(null)}}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this patient?</AlertDialogTitle>
            <AlertDialogDescription>
                This action will move the patient record for <span className="font-medium">{patientToArchive?.name}</span> to the archives. You can restore them later.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleArchivePatient}
            >
                Archive
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!patientToRestoreFromArchive} onOpenChange={(open) => {if(!open) setPatientToRestoreFromArchive(null)}}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Patient Found in Archives</AlertDialogTitle>
              <AlertDialogDescription>
                  A patient with M.R. <span className="font-mono">{patientToRestoreFromArchive?.id}</span> named <span className="font-medium">{patientToRestoreFromArchive?.name}</span> already exists in the archives. Would you like to restore them?
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleRestoreArchivedPatient}
              >
                  Restore Patient
              </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

