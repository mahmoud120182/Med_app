"use client";

import { Users, PackageX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { SearchResults } from '../search-results';

export default function Dashboard() {
  const { patients, batches, searchTerm } = useAppContext();

  if (searchTerm) {
    return <SearchResults />;
  }

  const expiringBatches = batches.filter(batch => batch.status !== 'Valid').sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
  const activePatientsCount = patients.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="sm:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">{activePatientsCount}</div>
                <p className="text-xs text-muted-foreground">+2 since last month</p>
              </CardContent>
            </Card>
             <Card className="sm:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Batches</CardTitle>
                <PackageX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl font-bold">{expiringBatches.length}</div>
                <p className="text-xs text-muted-foreground">
                  <Link href="/batches" className="hover:underline">
                    Check batch monitor
                  </Link>
                </p>
              </CardContent>
            </Card>
        </div>
    </div>
  );
}
