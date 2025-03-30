import React, { useEffect, useRef, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LoaderCircle, Pen, Plus, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Label } from "./ui/label"
import { 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
} from "lucide-react"
import ApiService from '@/services/ApiService'
import {Team} from '@/types/User'
import {Project} from '@/types/User'
import { useSearchParams  } from 'react-router-dom'
import { DialogDescription } from '@radix-ui/react-dialog';
import NotFound from './NotFound'
import Pagination from './Pagination'
import html2canvas from 'html2canvas'
import { v4 as uuidv4 } from 'uuid';


const ProjectsTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/projects"
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const take = parseInt(import.meta.env.VITE_TABLE_TAKE);

    const [projects, setProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('')
    const [newProject, setNewProject] = useState({ id: 0, name: ''})
    const [selectedProject, setSelectedProject] = useState({ id: 0, name: ''})
    const [isLoading, setIsLoading] = useState(false);
    const [addIsOpen, setAddIsOpen] = useState(false);
    const [updateIsOpen, setUpdateIsOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [projectAddError, setProjectAddError] = useState("")
    const [filterPage, setFilterPage] = useState(page)
    const [totalProjectPage, setTotalProjectPage] = useState(1)
    

    useEffect(() => {
        const fetchProjects = async () => {
          setIsInitialLoading(true);
            try {
              const [projectsResponse] = await Promise.all([
                apiService.get(`${apiEndpoint}`, {"take": take, "page": page}),
                new Promise(resolve => setTimeout(resolve, 1500))
              ]);

              setProjects(Array.isArray(projectsResponse.data.projects) ? projectsResponse.data.projects : []);
              setTotalProjectPage(projectsResponse.data.total? Math.ceil(projectsResponse.data.total / take) : 1)
            } catch (error) {
                console.error('Error fetching projects:', error);
                setProjects([]);
            } finally {
              setIsInitialLoading(false);
            }
        };

        fetchProjects();
    }, []);
    
    const handleProjectSelect = (project: Project) => {
        setSelectedProject({ ...project});
    };

    const filteredProjects = projects.length > 0 ? projects.filter(project =>
    [project.id.toString(), project.name].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    ): [];

    const handleAddProject = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.post(apiEndpoint, newProject),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (response.data.error) {
          throw new Error(response.data.error)
        } 

        setProjects(prevProjects => Array.isArray(prevProjects) ? [...prevProjects, response.data] : [response.data]);
        setAddIsOpen(false);
        setNewProject({ id: 0, name: ''});
      } catch (error: any) {
        setProjectAddError(error.message || "An error occurred. Please try again.")
      } finally {
        setIsLoading(false);
      }
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.put(`${apiEndpoint}/${selectedProject.id}`, selectedProject),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        setProjects(prevProjects => 
          Array.isArray(prevProjects) 
            ? prevProjects.map(project => project.id === selectedProject.id ? response.data : project)
            : [response.data]
        )
        setUpdateIsOpen(false);
      } catch (error: any) {
          console.error("Erro ao adicionar projeto! Tente novamente...");
      } finally {
        setIsLoading(false);
      }
    };

    const handleRemoveProject = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.delete(`${apiEndpoint}/${selectedProject.id}`),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);
        if (response.data.error) {
          throw new Error(response.data.error)
        }

        setProjects(prevProjects => 
          Array.isArray(prevProjects) 
            ? prevProjects.filter(project => project.id !== selectedProject.id)
            : []
        )
      } catch (error: any) {
        console.log("Erro ao excluir projeto! Tente novamente...");
        
      } finally {
        setIsLoading(false);
      }
    };

    const tabelaRef = useRef<HTMLTableElement>(null);
    return (
    <Card className='min-h-[70vh] flex flex-col'>
      <CardHeader>
        <CardTitle className='text-2xl'>Projetos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
      {isInitialLoading ? ( 
        <div className="flex-1 flex justify-center items-center h-64">
          <LoaderCircle className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <>
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center flex-1 max-w-lg">
            <Input
              placeholder="Procure por ID ou Nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mr-2"
            />
          </div>
          <div className="flex gap-2">
            <Dialog open={addIsOpen} onOpenChange={setAddIsOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                    <Plus /> Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Projeto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Projeto</Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      required
                    />
                  </div>


                  <div className='flex justify-end gap-1'>
                    <DialogClose asChild>
                    {isLoading? (<Button disabled type="button" variant="secondary">
                      Cancelar
                    </Button>) : (<Button type="button" variant="secondary">
                      Cancelar
                    </Button>)}
                    </DialogClose>
                    {isLoading ? (
                      <Button type="submit" disabled>
                        <LoaderCircle className="animate-spin" />Aguarde
                      </Button>
                    ) : (
                      newProject.name !== "" ? (
                        <Button type="submit">Adicionar</Button>
                      ) : (
                        <Button disabled type="submit">Adicionar</Button>
                      )
                    )}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {filteredProjects.length > 0 ? (
        <Table ref={tabelaRef}>
          <TableHeader>
            <TableRow>
            <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project, idx) => (
              <TableRow key={idx}>
                <TableCell>{project.id}</TableCell>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                    <div className='flex gap-1'>
                      <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleProjectSelect(project), setUpdateIsOpen(true)}}>
                        <Pen />
                      </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleProjectSelect(project)}}>
                                    <X />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Excluir Projeto</DialogTitle>
                                    <DialogDescription>Tem certeza que deseja excluir?</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRemoveProject} className="space-y-4">
                                    <div>
                                        <Label htmlFor="id">ID</Label>
                                        <Input
                                        disabled
                                        id="id"
                                        value={selectedProject.id}
                                        onChange={(e) => setSelectedProject({...selectedProject, id: Number(e.target.value)})}
                                        required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="name">Nome</Label>
                                        <Input
                                        disabled
                                        id="name"
                                        value={selectedProject.name}
                                        onChange={(e) => setSelectedProject({...selectedProject, name: e.target.value})}
                                        required
                                        />
                                    </div>

                                    <div className='flex justify-end gap-1'>
                                      <DialogClose asChild>
                                      {isLoading? (<Button disabled type="button" variant="secondary">
                                        Cancelar
                                      </Button>) : (<Button type="button" variant="secondary">
                                        Cancelar
                                      </Button>)}
                                      </DialogClose>
                                      {isLoading? (
                                        <Button type="submit" className='bg-red-800' disabled><LoaderCircle className="animate-spin" />Aguarde</Button>)
                                      :
                                      (<Button type="submit" className='bg-red-800'>Excluir</Button>)}
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <Dialog open={updateIsOpen} onOpenChange={setUpdateIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Atualizar Projeto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateProject} className="space-y-4">
                    <div>
                        <Label htmlFor="id">ID</Label>
                        <Input
                        disabled
                        id="id"
                        value={selectedProject.id}
                        onChange={(e) => setSelectedProject({...selectedProject, id: Number(e.target.value)})}
                        required
                        />
                    </div>
                    <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                        id="name"
                        value={selectedProject.name}
                        onChange={(e) => setSelectedProject({...selectedProject, name: e.target.value})}
                        required
                        />
                    </div>

        
                    <div className='flex justify-end gap-1'>
                      <DialogClose asChild>
                      {isLoading? (<Button disabled type="button" variant="secondary">
                        Cancelar
                      </Button>) : (<Button type="button" variant="secondary">
                        Cancelar
                      </Button>)}
                      </DialogClose>
                      {isLoading? (
                        <Button type="submit" disabled><LoaderCircle className="animate-spin" />Aguarde</Button>)
                      :
                      (<Button type="submit">Atualizar</Button>)}
                    </div>
                </form>
            </DialogContent>
          </Dialog>

        </Table>
        ): (<NotFound name='Nenhum projeto encontrado.'/>)}
        <Pagination name="projetos" filterPage={filterPage} totalUsersPage={totalProjectPage} />
      
        </>
      )}
      </CardContent>
    </Card>
  )
}

export default ProjectsTable;
