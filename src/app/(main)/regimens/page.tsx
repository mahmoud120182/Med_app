
"use client";

import * as React from 'react';
import { MoreHorizontal, PlusCircle, FileUp, Search, ArrowUpDown } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { type RegimenDefinition } from '@/lib/data';
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
    key: keyof RegimenDefinition;
    direction: 'ascending' | 'descending';
};

export default function RegimensPage() {
  const { regimens, setRegimens } = useAppContext();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [regimenToDelete, setRegimenToDelete] = React.useState<RegimenDefinition | null>(null);
  const [formState, setFormState] = React.useState({ id: `${Date.now()}`, code: '', meaning: '' });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const showSavedToast = React.useCallback(() => {
    toast({ title: "Saved", description: "Your changes have been saved." });
  }, [toast]);
  
  const requestSort = (key: keyof RegimenDefinition) => {
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


  const filteredRegimens = React.useMemo(() => {
    let sortableRegimens = [...regimens];
     if (sortConfig !== null) {
      sortableRegimens.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRegimens
      .filter(regimen => 
        regimen.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        regimen.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      )
    },[regimens, searchTerm, sortConfig]
  );

  const handleDeleteRegimen = () => {
    if (!regimenToDelete) return;
    setRegimens(prevRegs => prevRegs.filter(r => r.id !== regimenToDelete.id));
    toast({
      title: "Regimen Deleted",
      description: `The regimen code ${regimenToDelete.code} has been successfully deleted.`,
    });
    setRegimenToDelete(null);
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
        const jsonData = XLSX.utils.sheet_to_json<{ code: string; meaning: string }>(worksheet);
        
        let addedCount = 0;
        let skippedCount = 0;
        
        const newRegimens: RegimenDefinition[] = [];

        jsonData.forEach((row, index) => {
          if (row.code && typeof row.code === 'string' && row.meaning && typeof row.meaning === 'string') {
             newRegimens.push({ id: `REG-IMPORT-${Date.now()}-${index}`, code: row.code.toUpperCase(), meaning: row.meaning });
             addedCount++;
          } else {
             skippedCount++;
          }
        });

        if (newRegimens.length > 0) {
          setRegimens(prevRegs => [...prevRegs, ...newRegimens]);
        }

        toast({
          title: "Import Complete",
          description: `${addedCount} regimen(s) imported. ${skippedCount} invalid row(s) skipped.`,
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
    setFormState({ id: `${Date.now()}`, code: '', meaning: '' });
    setIsSheetOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'code') {
        setFormState(prev => ({ ...prev, [id]: value.toUpperCase() }));
    } else {
        setFormState(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleRegimenUpdate = React.useCallback((id: string, field: 'code' | 'meaning', value: string) => {
    setRegimens(prevRegs =>
      prevRegs.map(reg => (reg.id === id ? { ...reg, [field]: field === 'code' ? value.toUpperCase() : value } : reg))
    );
    showSavedToast();
  }, [setRegimens, showSavedToast]);

  const handleSaveRegimen = (e?: React.FormEvent) => {
    e?.preventDefault();
    setRegimens(prev => [...prev, { ...formState, code: formState.code.toUpperCase() }]);
    toast({ title: "Regimen Added", description: "The new regimen has been added." });
    
    setIsSheetOpen(false);
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Regimen Dictionary</CardTitle>
            <CardDescription>
              Commonly used medication regimen codes and their meanings.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search regimens..."
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
                <p>File must contain 'code' and 'meaning' columns.</p>
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
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Regimen</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">
                <Button variant="ghost" onClick={() => requestSort('code')}>
                  Code
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="whitespace-nowrap">
                 <Button variant="ghost" onClick={() => requestSort('meaning')}>
                  Meaning
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[50px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegimens.map(regimen => (
              <TableRow key={regimen.id}>
                <TableCell className="font-mono whitespace-nowrap">
                   <Input
                    defaultValue={regimen.code} 
                    className="h-10"
                    onKeyDown={handleTableKeyDown}
                    onBlur={(e) => handleRegimenUpdate(regimen.id, 'code', e.target.value)}
                  />
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  <Input
                    defaultValue={regimen.meaning} 
                    dir="rtl"
                    className="h-10"
                    onKeyDown={handleTableKeyDown}
                    onBlur={(e) => handleRegimenUpdate(regimen.id, 'meaning', e.target.value)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="text-destructive" onClick={() => setRegimenToDelete(regimen)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {filteredRegimens.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className='text-center text-muted-foreground py-10'>
                  No regimens found for &quot;{searchTerm}&quot;.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <form onSubmit={handleSaveRegimen}>
            <SheetHeader>
              <SheetTitle>Add New Regimen</SheetTitle>
              <SheetDescription>
                Enter the details for the new regimen.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input id="code" value={formState.code} onChange={handleFormChange} placeholder="e.g. QID" className="col-span-3 w-full" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meaning" className="text-right">Meaning</Label>
                <Input id="meaning" dir="rtl" value={formState.meaning} onChange={handleFormChange} placeholder="e.g. Four times a day" className="col-span-3 w-full"/>
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit">Save Regimen</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <AlertDialog open={!!regimenToDelete} onOpenChange={(open) => {if (!open) setRegimenToDelete(null)}}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the regimen <span className="font-medium">{regimenToDelete?.code}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleDeleteRegimen}
            >
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
