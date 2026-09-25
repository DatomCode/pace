import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  taskDrawerOpen: boolean
  taskDrawerTaskId: string | null
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  openTaskDrawer: (id: string) => void
  closeTaskDrawer: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  taskDrawerOpen: false,
  taskDrawerTaskId: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openTaskDrawer: (id) => set({ taskDrawerOpen: true, taskDrawerTaskId: id }),
  closeTaskDrawer: () => set({ taskDrawerOpen: false, taskDrawerTaskId: null }),
}))
