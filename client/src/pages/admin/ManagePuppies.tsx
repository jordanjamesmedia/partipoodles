import { useState } from "react";
import { useQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
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

export default function ManagePuppies() {
  const { toast } = useToast();
  const [selectedPuppy, setSelectedPuppy] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const puppies = useQuery(api.puppies.list);
  const litters = useQuery(api.litters.list);
  const puppiesLoading = puppies === undefined;

  const deletePuppy = useConvexMutation(api.puppies.remove);

  const handleEdit = (puppy: any) => {
    setSelectedPuppy(puppy);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: Id<"puppies">) => {
    if (confirm("Are you sure you want to delete this puppy?")) {
      setIsDeleting(true);
      try {
        await deletePuppy({ id });
        toast({
          title: "Success",
          description: "Puppy deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete puppy",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(false);
      }
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
          ) : puppies && puppies.length > 0 ? (
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
                        <TableRow key={puppy._id}>
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
                            <div className="font-medium" data-testid={`text-puppy-name-${puppy._id}`}>
                              {puppy.name}
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-puppy-color-${puppy._id}`}>
                            {puppy.color}
                          </TableCell>
                          <TableCell data-testid={`text-puppy-gender-${puppy._id}`}>
                            {puppy.gender}
                          </TableCell>
                          <TableCell data-testid={`text-puppy-dob-${puppy._id}`}>
                            {puppy.litter_id ? (
                              (() => {
                                const litter = litters?.find((l: any) => l._id === puppy.litter_id);
                                return litter ? new Date(litter.date_of_birth).toLocaleDateString() : 'No litter';
                              })()
                            ) : (
                              puppy.litter_date_of_birth
                                ? new Date(puppy.litter_date_of_birth).toLocaleDateString()
                                : 'No date'
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={getStatusBadgeClass(puppy.status || '')} data-testid={`text-puppy-status-${puppy._id}`}>
                              {puppy.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(puppy)}
                                data-testid={`button-edit-${puppy._id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(puppy._id)}
                                disabled={isDeleting}
                                data-testid={`button-delete-${puppy._id}`}
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
