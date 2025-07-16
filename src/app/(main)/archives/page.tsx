"use client";

import * as React from 'react';
import { ArchiveRestore, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type Patient } from '@/lib/data';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { Input } from '@/components/ui/input';


export default function ArchivesPage() {
  const { archivedPatients, setArchivedPatients, setPatients } = useAppContext();
  const { toast } = useToast();
  const [patientToPermanentlyDelete, setPatientToPermanentlyDelete] = React.useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleRestorePatient = (patientToRestore: Patient) => {
    setPatients(prev => {
      // Prevent adding a duplicate if it already exists
      if (prev.some(p => p.id === patientToRestore.id)) {
        return prev.sort((a, b) => a.name.localeCompare(b.name));
      }
      return [...prev, patientToRestore].sort((a, b) => a.name.localeCompare(b.name));
    });
    setArchivedPatients(prev => prev.filter(p => p.id !== patientToRestore.id));

    toast({
      title: "Patient Restored",
      description: `Patient ${patientToRestore.name} (M.R. ${patientToRestore.id}) has been restored.`,
    });
  };

  const handlePermanentDelete = () => {
    if (!patientToPermanentlyDelete) return;

    setArchivedPatients(prev => prev.filter(p => p.id !== patientToPermanentlyDelete.id));
    toast({
        variant: "destructive",
        title: "Patient Deleted",
        description: `Patient ${patientToPermanentlyDelete.name} (M.R. ${patientToPermanentlyDelete.id}) has been permanently deleted.`,
    });
    setPatientToPermanentlyDelete(null);
  }
  
  const filteredArchivedPatients = archivedPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.name.localeCompare(b.name));

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Archived Patients</CardTitle>
              <CardDescription>View, restore, or permanently delete archived patient records.</CardDescription>
            </div>
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search archives..."
                className="w-full rounded-lg bg-background pl-10 md:w-[200px] lg:w-[300px]"
                onChange={e => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>M.R.</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Station</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArchivedPatients.length > 0 ? (
                filteredArchivedPatients.map(patient => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-mono whitespace-nowrap">{patient.id}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{patient.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{patient.station}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleRestorePatient(patient)}>
                            <ArchiveRestore className="mr-2 h-4 w-4" />
                            Restore
                          </DropdownMenuItem>
                           <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setPatientToPermanentlyDelete(patient)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    {searchTerm ? `No archived patients found for "${searchTerm}".` : "No archived patients found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!patientToPermanentlyDelete} onOpenChange={(open) => {if (!open) setPatientToPermanentlyDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will <span className="font-bold">permanently delete</span> the patient record for <span className="font-medium">{patientToPermanentlyDelete?.name} ({patientToPermanentlyDelete?.id})</span> and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={handlePermanentDelete}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
