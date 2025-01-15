import { create } from 'zustand'

interface ToastState {
  message: string
  variant: 'success' | 'error' | 'loading' | 'default'
  isVisible: boolean
  showToast: (message: string, variant: 'success' | 'error' | 'loading' | 'default') => void
  hideToast: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  variant: 'default',
  isVisible: false,
  showToast: (message, variant) => set({ message, variant, isVisible: true }),
  hideToast: () => set({ isVisible: false })
})) 