"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Project } from "@/types/project"
import { LOCAL_STORAGE_KEYS } from "@/constants/app-constants"
import { toast } from "sonner"

interface ProjectsContextType {
  projects: Project[]
  activeProject: Project | null
  setActiveProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  deleteProject: (projectId: string) => void
  setProjects: (projects: Project[], activeProject: Project | null) => void
  clearProjects: () => void
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS);
        return storedProjects ? JSON.parse(storedProjects) : [];
      } catch (error) {
        console.error("Failed to parse projects:", error);
        return [];
      }
    }
    return [];
  });
  const [activeProject, setActiveProjectState] = useState<Project | null>(null)

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS)
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects)
        setProjects(parsedProjects)
        if (parsedProjects.length > 0) {
          setActiveProjectState(parsedProjects[0])
        }
      }
    } catch (error) {
      console.error("Failed to parse projects from localStorage:", error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
    } catch (error) {
      console.error("Failed to save projects to localStorage:", error)
    }
  }, [projects])


  const addProject = (project: Project) => {
    try {
      const newProjects = [...projects, project];
      setProjects(newProjects);
      setActiveProjectState(project);
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Error", {
        description: "Failed to create the project. Please try again.",
      });
    }
  };

  const updateProject = (updatedProject: Project) => {
    try {
      const projectCopy = JSON.parse(JSON.stringify(updatedProject))

      const newProjects = projects.map((project) =>
        project.id === projectCopy.id ? projectCopy : project
      )

      setProjects(newProjects)

      if (activeProject?.id === projectCopy.id) {
        setActiveProjectState(projectCopy)
      }
    } catch (error) {
      console.error("Error updating project:", error)
      toast.error("Error", {
        description: "Failed to update the project. Please try again.",
      })
    }
  }

  const deleteProject = (projectId: string) => {
    try {
      const newProjects = projects.filter((project) => project.id !== projectId)

      setProjects(newProjects)

      if (activeProject?.id === projectId) {
        const newActiveProject = newProjects.length > 0 ? newProjects[0] : null
        setActiveProjectState(newActiveProject)
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Error", {
        description: "Failed to delete the project. Please try again.",
      })
    }
  }

  const setProjectsWithActive = (newProjects: Project[], newActiveProject: Project | null) => {
    try {
      setProjects(newProjects)
      setActiveProjectState(newActiveProject)
    } catch (error) {
      console.error("Error setting projects:", error)
    }
  }

  const clearProjects = () => {
    try {
      setProjects([])
      setActiveProjectState(null)
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PROJECTS)

      toast.success("Projects cleared", {
        description: "All projects have been cleared.",
      })
    } catch (error) {
      console.error("Error clearing projects:", error)
      toast.error("Error", {
        description: "Failed to clear projects. Please try again.",
      })
    }
  }

  const setActiveProject = (project: Project | null) => {
    setActiveProjectState(project)
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        addProject,
        updateProject,
        deleteProject,
        setProjects: setProjectsWithActive,
        clearProjects,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider")
  }
  return context
}