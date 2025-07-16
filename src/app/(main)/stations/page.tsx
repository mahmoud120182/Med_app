
"use client";

import * as React from 'react';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
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
import { type Station } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
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

export default function StationsPage() {
  const { stations, setStations } = useAppContext();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [stationToDelete, setStationToDelete] = React.useState<Station | null>(null);
  const [formState, setFormState] = React.useState({ id: '', name: '' });
  const [searchTerm, setSearchTerm] = React.useState('');

  const { toast } = useToast();

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


  const filteredStations = React.useMemo(() => 
    [...stations]
      .filter(station => station.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a,b) => a.name.localeCompare(b.name)),
    [stations, searchTerm]
  );

  const handleDeleteStation = () => {
    if (!stationToDelete) return;
    setStations(prevStations => prevStations.filter(r => r.id !== stationToDelete.id));
    toast({
      title: "Station Deleted",
      description: `The station ${stationToDelete.name} has been successfully deleted.`,
    });
    setStationToDelete(null);
  };

  const handleOpenSheet = () => {
    setFormState({ id: '', name: '' });
    setIsSheetOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleStationUpdate = React.useCallback((id: string, newName: string) => {
    setStations(prevStations =>
      prevStations.map(station =>
        station.id === id ? { ...station, name: newName } : station
      )
    );
    showSavedToast();
  }, [setStations, showSavedToast]);

  const handleSaveStation = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (stations.some(r => r.name.toLowerCase() === formState.name.toLowerCase())) {
        toast({ variant: "destructive", title: "Duplicate Name", description: "A station with this name already exists." });
        return;
      }
      const newStation: Station = {
        id: `STA-${Date.now()}`,
        name: formState.name,
      }
      setStations(prev => [...prev, newStation].sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: "Station Added", description: "The new station has been added." });
    
    setIsSheetOpen(false);
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stations</CardTitle>
            <CardDescription>
              Manage the list of available stations.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search stations..."
                  className="w-full rounded-lg bg-background pl-10 md:w-[200px] lg:w-[300px]"
                  onChange={e => setSearchTerm(e.target.value)}
                  value={searchTerm}
                />
            </div>
            <Button size="sm" className="gap-1" onClick={handleOpenSheet}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Station</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Station Name</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStations.map(station => (
              <TableRow key={station.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  <Input 
                    defaultValue={station.name} 
                    className="h-auto bg-transparent border-transparent hover:border-input p-1"
                    onKeyDown={handleTableKeyDown}
                    onBlur={(e) => handleStationUpdate(station.id, e.target.value)}
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
                      <DropdownMenuItem className="text-destructive" onClick={() => setStationToDelete(station)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredStations.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className='text-center text-muted-foreground py-10'>
                  No stations found for &quot;{searchTerm}&quot;.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <form onSubmit={handleSaveStation}>
            <SheetHeader>
              <SheetTitle>Add New Station</SheetTitle>
              <SheetDescription>
                Enter the details for the new station.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={formState.name} onChange={handleFormChange} placeholder="e.g. Ward 5B" className="col-span-3 w-full" />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit">Save Station</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <AlertDialog open={!!stationToDelete} onOpenChange={(open) => {if (!open) setStationToDelete(null)}}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the station <span className="font-medium">{stationToDelete?.name}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleDeleteStation}
            >
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
