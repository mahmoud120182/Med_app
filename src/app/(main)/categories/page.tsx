
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
import { type PatientCategory } from '@/lib/data';
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

export default function CategoriesPage() {
  const { patientCategories, setPatientCategories } = useAppContext();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<PatientCategory | null>(null);
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


  const filteredCategories = React.useMemo(() => 
    [...patientCategories]
      .filter(category => category.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a,b) => a.name.localeCompare(b.name)),
    [patientCategories, searchTerm]
  );

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    setPatientCategories(prevCategories => prevCategories.filter(r => r.id !== categoryToDelete.id));
    toast({
      title: "Category Deleted",
      description: `The category ${categoryToDelete.name} has been successfully deleted.`,
    });
    setCategoryToDelete(null);
  };

  const handleOpenSheet = () => {
    setFormState({ id: '', name: '' });
    setIsSheetOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleCategoryUpdate = React.useCallback((id: string, newName: string) => {
    setPatientCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === id ? { ...category, name: newName } : category
      )
    );
    showSavedToast();
  }, [setPatientCategories, showSavedToast]);

  const handleSaveCategory = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (patientCategories.some(r => r.name.toLowerCase() === formState.name.toLowerCase())) {
        toast({ variant: "destructive", title: "Duplicate Name", description: "A category with this name already exists." });
        return;
      }
      const newCategory: PatientCategory = {
        id: `CAT-${Date.now()}`,
        name: formState.name,
      }
      setPatientCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: "Category Added", description: "The new category has been added." });
    
    setIsSheetOpen(false);
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Patient Categories</CardTitle>
            <CardDescription>
              Manage the list of available patient categories.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search categories..."
                  className="w-full rounded-lg bg-background pl-10 md:w-[200px] lg:w-[300px]"
                  onChange={e => setSearchTerm(e.target.value)}
                  value={searchTerm}
                />
            </div>
            <Button size="sm" className="gap-1" onClick={handleOpenSheet}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Category</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map(category => (
              <TableRow key={category.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  <Input 
                    defaultValue={category.name} 
                    className="h-auto bg-transparent border-transparent hover:border-input p-1"
                    onKeyDown={handleTableKeyDown}
                    onBlur={(e) => handleCategoryUpdate(category.id, e.target.value)}
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
                      <DropdownMenuItem className="text-destructive" onClick={() => setCategoryToDelete(category)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className='text-center text-muted-foreground py-10'>
                  No categories found for &quot;{searchTerm}&quot;.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <form onSubmit={handleSaveCategory}>
            <SheetHeader>
              <SheetTitle>Add New Category</SheetTitle>
              <SheetDescription>
                Enter the details for the new category.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={formState.name} onChange={handleFormChange} placeholder="e.g. Day Care" className="col-span-3 w-full" />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit">Save Category</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => {if (!open) setCategoryToDelete(null)}}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the category <span className="font-medium">{categoryToDelete?.name}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={handleDeleteCategory}
            >
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
