"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/AppContext';
import type { Patient, MedicationRecord } from '@/lib/data';

type MedicationSearchResult = {
  patient: Pick<Patient, 'id' | 'name'>;
  medication: MedicationRecord;
};

export function SearchResults() {
  const { patients, searchTerm } = useAppContext();

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  const patientResults: Patient[] = React.useMemo(() => {
    if (!searchTerm) return [];
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        p.id.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, patients, lowerCaseSearchTerm]);

  const medicationResults: MedicationSearchResult[] = React.useMemo(() => {
    if (!searchTerm) return [];
    const results: MedicationSearchResult[] = [];
    for (const patient of patients) {
      const allMedications = [
        ...patient.medications.regular,
        ...patient.medications.daily,
        ...patient.medications.depo,
      ];
      for (const med of allMedications) {
        if (
          med.medicationName.toLowerCase().includes(lowerCaseSearchTerm) ||
          med.medicationCode.toLowerCase().includes(lowerCaseSearchTerm)
        ) {
          results.push({
            patient: { id: patient.id, name: patient.name },
            medication: med,
          });
        }
      }
    }
    return results;
  }, [searchTerm, patients, lowerCaseSearchTerm]);
  
  const hasResults = patientResults.length > 0 || medicationResults.length > 0;

  if (!searchTerm) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">
        Search Results for &quot;{searchTerm}&quot;
      </h2>
      
      {!hasResults && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No results found.</p>
          </CardContent>
        </Card>
      )}

      {patientResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matching Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>M.R.</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Station</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientResults.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-mono whitespace-nowrap">{patient.id}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      <Link href={`/patients/${patient.id}`} className="hover:underline">
                        {patient.name}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{patient.station}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {medicationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matching Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient M.R.</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Medication Code</TableHead>
                  <TableHead>Medication Name</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead>Regimen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicationResults.map(({ patient, medication }) => (
                  <TableRow key={`${patient.id}-${medication.id}`}>
                    <TableCell className="font-mono whitespace-nowrap">{patient.id}</TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                       <Link href={`/patients/${patient.id}`} className="hover:underline">
                        {patient.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono whitespace-nowrap">{medication.medicationCode}</TableCell>
                    <TableCell className="whitespace-nowrap">{medication.medicationName}</TableCell>
                    <TableCell className="whitespace-nowrap">{medication.dose}</TableCell>
                    <TableCell className="whitespace-nowrap">{medication.regimen}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
