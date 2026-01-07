import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, Calendar, Award, Heart } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import ParentDogForm from "@/components/forms/ParentDogForm";

// Convex data type
interface ConvexParentDog {
  _id: Id<"parent_dogs">;
  name: string;
  registered_name?: string;
  color?: string;
  gender: string;
  date_of_birth?: string;
  description?: string;
  photos?: string[];
  status: string;
  health_testing?: string;
  achievements?: string;
  pedigree?: string;
  microchip_id?: string;
  registration_number?: string;
  weight?: number;
  height?: number;
  created_at?: string;
  updated_at?: string;
}

export default function ManageParentDogs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingParentDog, setEditingParentDog] = useState<ConvexParentDog | null>(null);

  // Convex queries and mutations
  const parentDogsData = useQuery(api.parentDogs.list);
  const deleteParentDog = useMutation(api.parentDogs.remove);
  const updateParentDog = useMutation(api.parentDogs.update);

  const parentDogs: ConvexParentDog[] = parentDogsData ?? [];
  const isLoading = parentDogsData === undefined;

  const handleDelete = async (id: Id<"parent_dogs">) => {
    try {
      await deleteParentDog({ id });
      toast({ title: "Success", description: "Parent dog deleted successfully!" });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete parent dog",
        variant: "destructive"
      });
    }
  };

  const filteredParentDogs = parentDogs.filter(dog =>
    dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dog.color && dog.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (dog.registered_name && dog.registered_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      retired: "bg-gray-100 text-gray-800",
      planned: "bg-blue-100 text-blue-800"
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      active: "Active Breeder",
      retired: "Retired",
      planned: "Future Breeder"
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const formatWeight = (weight: number | undefined) => {
    if (!weight) return "Not recorded";
    return `${weight.toFixed(1)} kg`;
  };

  // Convert parent dog to format expected by form
  const convertToFormFormat = (dog: ConvexParentDog) => ({
    id: dog._id,
    name: dog.name,
    registeredName: dog.registered_name || null,
    color: dog.color || "",
    gender: dog.gender as "male" | "female",
    dateOfBirth: dog.date_of_birth ? new Date(dog.date_of_birth) : null,
    description: dog.description || null,
    photos: dog.photos || [],
    status: dog.status,
    healthTesting: dog.health_testing || null,
    achievements: dog.achievements || null,
    pedigree: dog.pedigree || null,
    weight: dog.weight || null,
    height: dog.height || null,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Puppy Portal - Parent Dogs</h1>
          <p className="text-gray-600 mt-2">
            Manage your breeding dogs - dams and sires in your program.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Parent Dogs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parentDogs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Dams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parentDogs.filter(dog => dog.gender === 'female' && dog.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Sires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parentDogs.filter(dog => dog.gender === 'male' && dog.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Retired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {parentDogs.filter(dog => dog.status === 'retired').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search parent dogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-parent-dogs"
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-parent-dog">
                <Plus className="mr-2 h-4 w-4" />
                Add Parent Dog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[95vh] w-[95vw] flex flex-col z-[200] overflow-hidden">
              <DialogHeader className="flex-shrink-0 pb-4">
                <DialogTitle>Add New Parent Dog</DialogTitle>
                <DialogDescription>
                  Add a new dam or sire to your breeding program.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                <ParentDogForm onSuccess={() => setIsCreateDialogOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Parent Dogs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredParentDogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No parent dogs found" : "No parent dogs yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms to find more parent dogs."
                  : "Get started by adding your first parent dog to the breeding program."
                }
              </p>
              {!searchTerm && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Parent Dog
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[95vh] w-[95vw] flex flex-col z-[200] overflow-hidden">
                    <DialogHeader className="flex-shrink-0 pb-4">
                      <DialogTitle>Add New Parent Dog</DialogTitle>
                      <DialogDescription>
                        Add a new dam or sire to your breeding program.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                      <ParentDogForm onSuccess={() => setIsCreateDialogOpen(false)} />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParentDogs.map((parentDog) => {
              const hasPhotos = parentDog.photos && parentDog.photos.length > 0;
              const mainPhoto = hasPhotos && parentDog.photos ? parentDog.photos[0] : null;

              return (
                <Card key={parentDog._id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`parent-dog-card-${parentDog._id}`}>
                  <div className="relative">
                    {hasPhotos && mainPhoto ? (
                      <img
                        src={mainPhoto.startsWith('https://') ? mainPhoto : `/public-objects/uploads/${mainPhoto}`}
                        alt={`${parentDog.name} - ${parentDog.color}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex flex-col items-center justify-center">
                        <img
                          src="/attached_assets/puppy paw print_1754361694595.png"
                          alt="Paw print"
                          className="w-16 h-16 opacity-60 mb-2"
                        />
                        <span className="text-orange-700 font-medium">Image coming soon</span>
                      </div>
                    )}
                    <Badge className={`absolute top-2 left-2 ${getStatusBadge(parentDog.status)}`}>
                      {getStatusText(parentDog.status)}
                    </Badge>
                    <Badge className="absolute top-2 right-2 bg-primary/90 text-white">
                      {parentDog.gender === 'male' ? '♂ Sire' : '♀ Dam'}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{parentDog.name}</CardTitle>
                    {parentDog.registered_name && (
                      <CardDescription className="text-sm italic">
                        {parentDog.registered_name}
                      </CardDescription>
                    )}
                    <CardDescription className="text-primary font-medium">
                      {parentDog.color || "Color not specified"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {parentDog.date_of_birth ? (
                          <>Born {new Date(parentDog.date_of_birth).toLocaleDateString('en-AU', {
                            month: 'short',
                            year: 'numeric'
                          })}</>
                        ) : (
                          "Birth date not set"
                        )}
                      </div>
                      <div className="flex items-center">
                        <Heart className="mr-1 h-3 w-3" />
                        {formatWeight(parentDog.weight)}
                      </div>
                    </div>

                    {parentDog.achievements && (
                      <div className="flex items-start">
                        <Award className="mr-1 h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700 line-clamp-2">
                          {parentDog.achievements}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Dialog open={editingParentDog?._id === parentDog._id} onOpenChange={(open) => {
                        if (!open) setEditingParentDog(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs px-2 py-1"
                            onClick={() => setEditingParentDog(parentDog)}
                            data-testid={`button-edit-parent-dog-${parentDog._id}`}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl max-h-[95vh] w-[95vw] flex flex-col z-[200] overflow-hidden">
                          <DialogHeader className="flex-shrink-0 pb-4">
                            <DialogTitle>Edit Parent Dog</DialogTitle>
                            <DialogDescription>
                              Update the information for {editingParentDog?.name || parentDog.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                            {editingParentDog && editingParentDog._id === parentDog._id && (
                              <ParentDogForm
                                parentDog={convertToFormFormat(editingParentDog)}
                                onSuccess={() => setEditingParentDog(null)}
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1"
                            data-testid={`button-delete-parent-dog-${parentDog._id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Parent Dog</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {parentDog.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(parentDog._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
