import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/AdminLayout";
import PuppyForm from "@/components/forms/PuppyForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Puppy } from "@shared/schema";

export default function ManagePuppies() {
  const { toast } = useToast();
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: puppies = [], isLoading: puppiesLoading } = useQuery<Puppy[]>({
    queryKey: ["/api/admin/puppies"],
  });

  // Fetch litters for birth date display
  const { data: litters = [] } = useQuery({
    queryKey: ['/api/litters'],
    queryFn: async () => {
      const response = await fetch('/api/litters');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/puppies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/puppies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
      toast({
        title: "Success",
        description: "Puppy deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/admin-login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete puppy",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this puppy?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedPuppy(null);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'status-badge status-available';
      case 'reserved':
        return 'status-badge status-reserved';
      case 'sold':
        return 'status-badge status-sold';
      default:
        return 'status-badge';
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800" data-testid="text-manage-puppies-title">Puppy Portal - Manage Puppies</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary" data-testid="button-add-puppy">
              <Plus className="mr-2 h-5 w-5" />
              Add New Puppy
            </Button>
          </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[200]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedPuppy ? 'Edit Puppy' : 'Add New Puppy'}
                  </DialogTitle>
                </DialogHeader>
                <PuppyForm 
                  puppy={selectedPuppy} 
                  onClose={handleFormClose}
                />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Puppies</CardTitle>
        </CardHeader>
        <CardContent>
          {puppiesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
            </div>
          ) : puppies.length > 0 ? (
            <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>DOB</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {puppies.map((puppy) => (
                        <TableRow key={puppy.id}>
                          <TableCell>
                            {puppy.photos && puppy.photos.length > 0 ? (
                              <img 
                                src={puppy.photos[0]} 
                                alt={puppy.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No photo</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium" data-testid={`text-puppy-name-${puppy.id}`}>
                              {puppy.name}
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-puppy-color-${puppy.id}`}>
                            {puppy.color}
                          </TableCell>
                          <TableCell data-testid={`text-puppy-gender-${puppy.id}`}>
                            {puppy.gender}
                          </TableCell>
                          <TableCell data-testid={`text-puppy-dob-${puppy.id}`}>
                            {puppy.litterId ? (
                              (() => {
                                const litter = litters.find((l: any) => l.id === puppy.litterId);
                                return litter ? new Date(litter.dateOfBirth).toLocaleDateString() : 'No litter';
                              })()
                            ) : (
                              puppy.litterDateOfBirth 
                                ? new Date(puppy.litterDateOfBirth).toLocaleDateString()
                                : 'No date'
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={getStatusBadgeClass(puppy.status)} data-testid={`text-puppy-status-${puppy.id}`}>
                              {puppy.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(puppy)}
                                data-testid={`button-edit-${puppy.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(puppy.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-${puppy.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
            </div>
          ) : (
            <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No puppies found</p>
                  <Button 
                    onClick={() => setIsFormOpen(true)} 
                    className="btn-primary"
                    data-testid="button-add-first-puppy"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Your First Puppy
                  </Button>
                </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
