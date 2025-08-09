type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export default function Modal({ isOpen, onClose, children, className = "max-w-md w-full" }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center">
      <div className={`bg-white p-6 rounded shadow-lg ${className}`}>
        {children}
      </div>
    </div>
  )
}