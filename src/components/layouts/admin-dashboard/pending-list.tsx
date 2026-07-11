import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { Header } from './header';
import { Main } from './main';

export function PendingAdminList() {
  const headerColumns = Array.from({ length: 6 });
  const rows = Array.from({ length: 5 });

  return (
    <>
      <Header crumbs={[]} />
      <Main>
        <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full sm:w-72" />
        </div>

        <Card className="overflow-hidden duration-300 animate-in fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="mt-2 space-y-3">
              <div className="flex items-center justify-between gap-4 border-b pb-3">
                {headerColumns.map((_, i) => (
                  <Skeleton
                    key={`th-${i}`}
                    className="h-4 w-full max-w-[120px]"
                  />
                ))}
              </div>

              {rows.map((_, rowIdx) => (
                <div
                  key={`tr-${rowIdx}`}
                  className="flex items-center justify-between gap-4 border-b border-muted/20 py-2.5 last:border-b-0"
                >
                  <Skeleton className="h-4 w-8" />
                  <div className="flex w-full max-w-[150px] items-center gap-3">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                  <Skeleton className="h-4 w-full max-w-[100px]" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-7 w-7" />
            </div>
          </CardFooter>
        </Card>
      </Main>
    </>
  );
}
