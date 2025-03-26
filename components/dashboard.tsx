"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Menu, Sun, Moon, Edit } from "lucide-react"
import ProjectCard from "@/components/project-card"
import TaskBoard from "@/components/task-board"
import { useProjects } from "@/hooks/use-projects"
import ProjectDialog from "@/components/project-dialog"
import type { Project } from "@/types/project"
import { ThemeToggle } from "@/components/theme-toggle"
import { SeedDataButton } from "@/components/seed-data-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { DeleteProjectAlert } from "@/components/delete-project-alert"

export default function Dashboard() {
  const { projects, activeProject, setActiveProject } = useProjects()
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState("projects")
  const { theme, setTheme } = useTheme()

  const handleProjectSelect = (project: Project) => {
    setActiveProject(project)
    setActiveTab("board")
  }

  const handleEditProject = () => {
    if (activeProject) {
      setEditingProject(activeProject)
      setIsProjectDialogOpen(true)
    }
  }

  const handleCreateProject = () => {
    setEditingProject(null)
    setIsProjectDialogOpen(true)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Project Management</h1>

        {/* Mobile actions dropdown */}
        <div className="flex sm:hidden w-full justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="projects" className="flex-1">
                Projects
              </TabsTrigger>
              <TabsTrigger value="board" className="flex-1" disabled={!activeProject}>
                Task Board
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2 h-9 w-9">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50">
              <DropdownMenuItem onClick={handleCreateProject}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </DropdownMenuItem>
              {activeProject && activeTab === "board" && (
                <>
                  <DropdownMenuItem onClick={handleEditProject}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div className="hidden md:block w-full" onClick={(e) => e.stopPropagation()}>
                        <DeleteProjectAlert
                          project={activeProject}
                          variant="ghost"
                          size="sm"
                          className="justify-start p-0 mr-2 h-4 w-4"
                          onBack={() => setActiveTab("projects")}
                        />
                    </div>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                Toggle Theme
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                  <SeedDataButton />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2">
          <ThemeToggle />
          <SeedDataButton />
          <Button onClick={handleCreateProject} className="h-9">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
          {activeProject && activeTab === "board" && (
            <>
              <Button onClick={handleEditProject} variant="outline" className="h-9">
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </Button>
              <DeleteProjectAlert project={activeProject} variant="destructive" className="h-9" onBack={() => setActiveTab("projects")} />
            </>
          )}
        </div>
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:block">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="board" disabled={!activeProject}>
              Task Board
            </TabsTrigger>
          </TabsList>
          <TabsContent value="projects" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectSelect(project)}
                  isActive={activeProject?.id === project.id}
                />
              ))}
              {projects.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-8 sm:p-12 bg-muted rounded-lg" suppressHydrationWarning>
                  <p className="text-muted-foreground mb-4">No projects yet</p>
                  <Button onClick={handleCreateProject} className="h-9">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create your first project
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="board">{activeProject && <TaskBoard project={activeProject} />}</TabsContent>
        </Tabs>
      </div>

      {/* Mobile content */}
      <div className="sm:hidden">
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectSelect(project)}
                isActive={activeProject?.id === project.id}
              />
            ))}
            {projects.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted rounded-lg" suppressHydrationWarning>
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Button onClick={handleCreateProject} className="h-9">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create your first project
                </Button>
              </div>
            )}
          </div>
        )}
        {activeTab === "board" && activeProject && <TaskBoard project={activeProject}  />}
      </div>

      <ProjectDialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen} project={editingProject} onBack={() => setActiveTab("projects")} />
    </div>
  )
}

