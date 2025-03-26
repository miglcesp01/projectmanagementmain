"use client"

import ProjectDialog from "@/components/project-dialog"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  return <ProjectDialog open={open} onOpenChange={onOpenChange} />
}

