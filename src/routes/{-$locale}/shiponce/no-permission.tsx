import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/shiponce/no-permission')({
  component: NoPermissionPage,
});

function NoPermissionPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-normal">Access denied</h1>
    </div>
  );
}
