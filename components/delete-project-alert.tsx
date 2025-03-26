"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import type { Project } from "@/types/project"
import { toast } from "sonner"

interface DeleteProjectAlertProps {
  project: Project
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string,
  onBack?: () => void
}

export function DeleteProjectAlert({
  project,
  variant = "destructive",
  size = "default",
  className = "",
  onBack,
}: DeleteProjectAlertProps) {
  const { deleteProject, addProject } = useProjects()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    setIsDeleting(true)

    try {
      const projectToDelete = JSON.parse(JSON.stringify(project)) as Project

      deleteProject(project.id)
      if(onBack) {
        onBack()
      }

      toast.success("Project deleted", {
        description: "The project has been deleted.",
        action: {
          label: "Undo",
          onClick: (id) => {
            addProject(projectToDelete)
            toast.dismiss()
          },
        },
      })
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Error", {
        description: "Failed to delete the project. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Delete Project
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will delete the project "{project.name}" and all its tasks. You can undo this action from the
            notification that appears after deletion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

