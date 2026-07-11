import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/{-$locale}/_oauth')({
  component: OAuthLayout,
});

function OAuthLayout() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Outlet />
    </div>
  );
}
