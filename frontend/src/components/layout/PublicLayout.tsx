import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-bg">
      <Outlet />
    </div>
  )
}
