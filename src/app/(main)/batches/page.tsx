
"use client";

import * as React from 'react';
import { MoreHorizontal, PlusCircle, FileUp, Search, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { type Batch } from '@/lib/data';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
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
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
import { useAppContext } from '@/context/AppContext';

type SortConfig = {
    key: keyof Batch;
    direction: 'ascending' | 'descending';
};


export default function BatchesPage() {
  const { batches, setBatches, medications } = useAppContext();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [batchToRemove, setBatchToRemove] = React.useState<Batch | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>({ key: 'expiryDate', direction: 'ascending' });

  const [formState, setFormState] = React.useState({
    medicationCode: '',
    medicationName: '',
    batchId: '',
    expiryDate: '',
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const requestSort = (key: keyof Batch) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
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


  const handleRemoveBatch = () => {
    if (!batchToRemove) return;
    setBatches(prevBatches => prevBatches.filter(b => b.id !== batchToRemove.id));
    toast({
      title: "Batch Removed",
      description: `Batch ${batchToRemove.batchId} has been successfully removed.`,
    });
    setBatchToRemove(null);
  };

  const calculateStatus = (expiryDate: Date): 'Valid' | 'Expiring Soon' | 'Expired' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
      return 'Expired';
    }
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    if (expiry <= thirtyDaysFromNow) {
      return 'Expiring Soon';
    }
    return 'Valid';
  };

  const handleBatchUpdate = (id: string, field: keyof Batch, value: string) => {
    setBatches(prevBatches =>
      prevBatches.map(batch => {
        if (batch.id === id) {
          const updatedBatch = { ...batch, [field]: value };
          if (field === 'medicationCode') {
            updatedBatch.medicationCode = value.toUpperCase();
          }
          if (field === 'expiryDate') {
            const newDate = parse(value, 'dd/MM/yyyy', new Date());
            if (!isNaN(newDate.getTime())) {
              updatedBatch.expiryDate = newDate;
              updatedBatch.status = calculateStatus(newDate);
            }
          }
          return updatedBatch;
        }
        return batch;
      })
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<{ medicationCode: string; medicationName: string; batchId: string; expiryDate: string | number }>(worksheet);

        const existingBatchIds = new Set(batches.map(b => b.batchId));
        let addedCount = 0;
        let skippedCount = 0;
        
        const newBatches: Batch[] = [];

        jsonData.forEach((row, index) => {
          const { medicationCode, medicationName, batchId, expiryDate } = row;
          if (medicationCode && medicationName && batchId && expiryDate && !existingBatchIds.has(batchId)) {
            let parsedDate;
            if (typeof expiryDate === 'number') {
                parsedDate = new Date(Math.round((expiryDate - 25569) * 86400 * 1000));
            } else {
                parsedDate = parse(expiryDate, 'dd/MM/yyyy', new Date());
            }

            if (!isNaN(parsedDate.getTime())) {
                const newBatch: Batch = {
                  id: `BCH-IMPORT-${Date.now()}-${index}`,
                  medicationCode: medicationCode.toUpperCase(),
                  medicationName,
                  batchId,
                  expiryDate: parsedDate,
                  status: calculateStatus(parsedDate),
                };
                newBatches.push(newBatch);
                existingBatchIds.add(batchId);
                addedCount++;
            } else {
                skippedCount++;
            }
          } else {
             skippedCount++;
          }
        });

        if (newBatches.length > 0) {
          setBatches(prevBatches => [...prevBatches, ...newBatches]);
        }

        toast({
          title: "Import Complete",
          description: `${addedCount} batch(es) imported. ${skippedCount} duplicate or invalid row(s) skipped.`,
        });

      } catch (error) {
        console.error("Error processing file:", error);
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "There was an error processing the Excel file. Please ensure it is a valid format.",
        });
      } finally {
        if (event.target) {
          event.target.value = '';
        }
      }
    };
    reader.onerror = () => {
       toast({
          variant: "destructive",
          title: "Import Failed",
          description: "Could not read the selected file.",
        });
    }

    reader.readAsArrayBuffer(file);
  };

  const handleOpenSheet = () => {
    setFormState({ medicationCode: '', medicationName: '', batchId: '', expiryDate: '' });
    setIsSheetOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let newFormState = { ...formState, [id]: value };

    if (id === 'medicationCode') {
        const uppercaseValue = value.toUpperCase();
        newFormState.medicationCode = uppercaseValue;
        const matchedMed = medications.find(m => m.code.toLowerCase() === uppercaseValue.toLowerCase());
        if (matchedMed) {
            newFormState.medicationName = matchedMed.name;
        }
    } else {
        newFormState = { ...formState, [id]: value };
    }
    
    setFormState(newFormState);
  };

  const handleSaveBatch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const expiryDate = parse(formState.expiryDate, 'dd/MM/yyyy', new Date());
    
    if (batches.some(b => b.batchId === formState.batchId)) {
      toast({ variant: "destructive", title: "Duplicate Batch ID", description: "A batch with this ID already exists." });
      return;
    }
    const newBatch: Batch = {
      id: `BCH-MANUAL-${Date.now()}`,
      ...formState,
      medicationCode: formState.medicationCode.toUpperCase(),
      expiryDate,
      status: calculateStatus(expiryDate),
    };
    setBatches(prev => [...prev, newBatch]);
    toast({ title: "Batch Added", description: "The new batch has been added." });

    setIsSheetOpen(false);
  };
  
  const sortedBatches = React.useMemo(() => {
    let sortableBatches = [...batches];
    if (sortConfig !== null) {
      sortableBatches.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBatches;
  }, [batches, sortConfig]);

  const filteredBatches = sortedBatches.filter(batch => 
      batch.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.medicationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batchId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Batch Monitor</CardTitle>
            <CardDescription>Track medication batches and their expiry dates.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search batches..."
                className="w-full rounded-lg bg-background pl-10 md:w-[200px] lg:w-[300px]"
                onChange={e => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Import from Excel</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Columns: medicationCode, medicationName, batchId, expiryDate (dd/MM/yyyy)</p>
              </TooltipContent>
            </Tooltip>
             <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
            />
            <Button size="sm" className="gap-1" onClick={handleOpenSheet}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add New Batch</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort('medicationCode')}>
                  Code
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort('medicationName')}>
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort('batchId')}>
                  Batch
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort('expiryDate')}>
                  Expiry Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                 <Button variant="ghost" onClick={() => requestSort('status')}>
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.map(batch => (
              <TableRow key={batch.id}>
                <TableCell className="font-mono whitespace-nowrap">
                    <Input defaultValue={batch.medicationCode} className="h-10" onKeyDown={handleTableKeyDown} onBlur={(e) => handleBatchUpdate(batch.id, 'medicationCode', e.target.value)} />
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                    <Input defaultValue={batch.medicationName} className="h-10" onKeyDown={handleTableKeyDown} onBlur={(e) => handleBatchUpdate(batch.id, 'medicationName', e.target.value)} />
                </TableCell>
                <TableCell className="whitespace-nowrap">{batch.batchId}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <Input
                    defaultValue={format(batch.expiryDate, 'dd/MM/yyyy')}
                    className="h-10"
                    onKeyDown={handleTableKeyDown}
                    onBlur={(e) => handleBatchUpdate(batch.id, 'expiryDate', e.target.value)} 
                  />
                </TableCell>
                <TableCell className="text-center whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className={cn({
                      'text-green-700 border-green-300 bg-green-50 dark:text-green-300 dark:border-green-700 dark:bg-green-900/50': batch.status === 'Valid',
                      'text-yellow-700 border-yellow-300 bg-yellow-50 dark:text-yellow-300 dark:border-yellow-700 dark:bg-yellow-900/50': batch.status === 'Expiring Soon',
                      'text-red-700 border-red-300 bg-red-50 dark:text-red-300 dark:border-red-700 dark:bg-red-900/50': batch.status === 'Expired',
                    })}
                  >
                    {batch.status}
                  </Badge>
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
                      <DropdownMenuItem className="text-destructive" onClick={() => setBatchToRemove(batch)}>Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredBatches.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className='text-center text-muted-foreground py-10'>
                  No batches found for &quot;{searchTerm}&quot;.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
         <form onSubmit={handleSaveBatch}>
          <SheetHeader>
            <SheetTitle>Add New Batch</SheetTitle>
            <SheetDescription>
              Enter the details for the new medication batch.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medicationCode" className="text-right">Medication Code</Label>
              <Input id="medicationCode" value={formState.medicationCode} onChange={handleFormChange} placeholder="LIS10" className="col-span-3 w-full" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medicationName" className="text-right">Medication</Label>
              <Input id="medicationName" value={formState.medicationName} onChange={handleFormChange} placeholder="Lisinopril" className="col-span-3 w-full" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batchId" className="text-right">Batch ID</Label>
              <Input id="batchId" value={formState.batchId} onChange={handleFormChange} placeholder="LP202501" className="col-span-3 w-full" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">Expiry Date</Label>
              <Input id="expiryDate" value={formState.expiryDate} onChange={handleFormChange} type="text" placeholder="dd/MM/yyyy" className="col-span-3 w-full" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Batch</Button>
          </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <AlertDialog open={!!batchToRemove} onOpenChange={(open) => {if (!open) setBatchToRemove(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the batch
              record for <span className="font-medium">{batchToRemove?.medicationName} ({batchToRemove?.batchId})</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={handleRemoveBatch}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
