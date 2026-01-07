import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Calendar, Crown, Plus } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import type { Id } from "../../../../convex/_generated/dataModel";

// Convex data types
interface ConvexLitter {
  _id: Id<"litters">;
  name: string;
  date_of_birth?: string;
  dam_id?: string;
  sire_id?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ConvexParentDog {
  _id: Id<"parent_dogs">;
  name: string;
  gender: string;
}

export default function ManageLitters() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLitter, setEditingLitter] = useState<ConvexLitter | null>(null);
  const [litterName, setLitterName] = useState("");
  const [litterDateOfBirth, setLitterDateOfBirth] = useState("");
  const [litterDamId, setLitterDamId] = useState("none");
  const [litterSireId, setLitterSireId] = useState("none");
  const [litterIsActive, setLitterIsActive] = useState(true);

  // Convex queries and mutations
  const littersData = useQuery(api.litters.list);
  const parentDogsData = useQuery(api.parentDogs.list);
  const createLitter = useMutation(api.litters.create);
  const updateLitter = useMutation(api.litters.update);

  const litters: ConvexLitter[] = littersData ?? [];
  const parentDogs: ConvexParentDog[] = parentDogsData ?? [];

  // Get female dogs for dam selection
  const femaleDogs = parentDogs.filter(dog => dog.gender === 'female');
  // Get male dogs for sire selection
  const maleDogs = parentDogs.filter(dog => dog.gender === 'male');

  const resetForm = () => {
    setEditingLitter(null);
    setIsEditing(false);
    setLitterName("");
    setLitterDateOfBirth("");
    setLitterDamId("none");
    setLitterSireId("none");
    setLitterIsActive(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsEditing(false);
    setShowDialog(true);
  };

  const openEditDialog = (litter: ConvexLitter) => {
    setEditingLitter(litter);
    setIsEditing(true);
    setLitterName(litter.name);
    setLitterDateOfBirth(litter.date_of_birth ? new Date(litter.date_of_birth).toISOString().split('T')[0] : "");
    setLitterDamId(litter.dam_id || "none");
    setLitterSireId(litter.sire_id || "none");
    setLitterIsActive(litter.is_active ?? true);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!litterName || !litterDateOfBirth) {
      toast({
        title: "Error",
        description: "Please fill in Litter Name and Date of Birth",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing && editingLitter) {
        // Update existing litter
        await updateLitter({
          id: editingLitter._id,
          name: litterName,
          date_of_birth: litterDateOfBirth,
          dam_id: litterDamId === "none" ? undefined : litterDamId,
          sire_id: litterSireId === "none" ? undefined : litterSireId,
          is_active: litterIsActive,
        });
        toast({
          title: "Success",
          description: "Litter updated successfully",
        });
      } else {
        // Create new litter
        await createLitter({
          name: litterName,
          date_of_birth: litterDateOfBirth,
          dam_id: litterDamId === "none" ? undefined : litterDamId,
          sire_id: litterSireId === "none" ? undefined : litterSireId,
          is_active: litterIsActive,
        });
        toast({
          title: "Success",
          description: "Litter created successfully",
        });
      }

      setShowDialog(false);
      resetForm();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save litter",
        variant: "destructive",
      });
    }
  };

  const getDamName = (damId: string | undefined) => {
    if (!damId) return "Not set";
    const dam = parentDogs.find(dog => dog._id === damId);
    return dam?.name || "Unknown";
  };

  const getSireName = (sireId: string | undefined) => {
    if (!sireId) return "Not set";
    const sire = parentDogs.find(dog => dog._id === sireId);
    return sire?.name || "Unknown";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Puppy Portal - Litter Management</h1>
          <Button onClick={openCreateDialog} data-testid="button-add-litter">
            <Plus className="h-4 w-4 mr-2" />
            Add New Litter
          </Button>
        </div>

      {litters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Crown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Litters Found</h3>
            <p className="text-gray-500 mb-4">
              Create your first litter to start managing puppies.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Litter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {litters.map((litter) => (
            <Card key={litter._id} className="border-l-4 border-l-orange-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <Crown className="h-6 w-6 text-orange-600" />
                  <div>
                    <CardTitle className="text-xl text-gray-900">{litter.name}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>Born: {litter.date_of_birth ? new Date(litter.date_of_birth).toLocaleDateString() : "Date not set"}</span>
                      <Badge variant={litter.is_active ? "default" : "secondary"}>
                        {litter.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(litter)}
                  data-testid={`button-edit-litter-${litter._id}`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Dam (Mother):</span>
                    <span className="ml-2 text-gray-600">{getDamName(litter.dam_id)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sire (Father):</span>
                    <span className="ml-2 text-gray-600">{getSireName(litter.sire_id)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Litter Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="z-[200]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Litter" : "Add New Litter"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Litter Name *</label>
              <Input
                placeholder="e.g., Pippa x Po Litter, Spring 2024 Litter"
                value={litterName}
                onChange={(e) => setLitterName(e.target.value)}
                data-testid="input-litter-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date of Birth *</label>
              <Input
                type="date"
                value={litterDateOfBirth}
                onChange={(e) => setLitterDateOfBirth(e.target.value)}
                data-testid="input-litter-dob"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Dam (Mother)</label>
              <Select onValueChange={setLitterDamId} value={litterDamId}>
                <SelectTrigger data-testid="select-litter-dam">
                  <SelectValue placeholder="Select dam..." />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  <SelectItem value="none">None</SelectItem>
                  {femaleDogs.length === 0 ? (
                    <SelectItem value="no-females" disabled>No female dogs available</SelectItem>
                  ) : (
                    femaleDogs.map((dog) => (
                      <SelectItem key={dog._id} value={dog._id}>
                        {dog.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {femaleDogs.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">Add female parent dogs first to select a dam</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Sire (Father)</label>
              <Select onValueChange={setLitterSireId} value={litterSireId}>
                <SelectTrigger data-testid="select-litter-sire">
                  <SelectValue placeholder="Select sire..." />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  <SelectItem value="none">None</SelectItem>
                  {maleDogs.length === 0 ? (
                    <SelectItem value="no-males" disabled>No male dogs available</SelectItem>
                  ) : (
                    maleDogs.map((dog) => (
                      <SelectItem key={dog._id} value={dog._id}>
                        {dog.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {maleDogs.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">Add male parent dogs first to select a sire</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select onValueChange={(value) => setLitterIsActive(value === 'true')} value={litterIsActive.toString()}>
                <SelectTrigger data-testid="select-litter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[300]">
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
                data-testid="button-cancel-litter"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                data-testid="button-save-litter"
              >
                {isEditing ? "Save Changes" : "Create Litter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
