import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Edit, Plus, Calendar, Crown } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import type { Litter, ParentDog, InsertLitter } from "@shared/schema";

export default function ManageLitters() {
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLitter, setEditingLitter] = useState<Litter | null>(null);
  const [litterName, setLitterName] = useState("");
  const [litterDateOfBirth, setLitterDateOfBirth] = useState("");
  const [litterDamId, setLitterDamId] = useState("");
  const [litterSireId, setLitterSireId] = useState("");
  const [litterIsActive, setLitterIsActive] = useState(true);

  // Fetch litters
  const { data: litters = [], refetch } = useQuery({
    queryKey: ["/api/admin/litters"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/litters");
      return response.json() as Promise<Litter[]>;
    },
  });

  // Fetch parent dogs for dropdowns
  const { data: parentDogs = [] } = useQuery({
    queryKey: ["/api/admin/parent-dogs"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/parent-dogs");
      return response.json() as Promise<ParentDog[]>;
    },
  });

  const updateLitterMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<InsertLitter> }) => {
      await apiRequest("PUT", `/api/admin/litters/${data.id}`, data.updates);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/litters"] });
      setShowEditDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Litter updated successfully",
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
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update litter",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setEditingLitter(null);
    setLitterName("");
    setLitterDateOfBirth("");
    setLitterDamId("none");
    setLitterSireId("none");
    setLitterIsActive(true);
  };

  const openEditDialog = (litter: Litter) => {
    setEditingLitter(litter);
    setLitterName(litter.name);
    setLitterDateOfBirth(new Date(litter.dateOfBirth).toISOString().split('T')[0]);
    setLitterDamId(litter.damId || "none");
    setLitterSireId(litter.sireId || "none");
    setLitterIsActive(litter.isActive ?? true);
    setShowEditDialog(true);
  };

  const handleSubmit = () => {
    if (!editingLitter || !litterName || !litterDateOfBirth) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    updateLitterMutation.mutate({
      id: editingLitter.id,
      updates: {
        name: litterName,
        dateOfBirth: new Date(litterDateOfBirth),
        damId: litterDamId === "none" ? null : litterDamId || null,
        sireId: litterSireId === "none" ? null : litterSireId || null,
        isActive: litterIsActive,
      },
    });
  };

  const getDamName = (damId: string | null) => {
    if (!damId) return "Not set";
    const dam = parentDogs.find(dog => dog.id === damId);
    return dam?.name || "Unknown";
  };

  const getSireName = (sireId: string | null) => {
    if (!sireId) return "Not set";
    const sire = parentDogs.find(dog => dog.id === sireId);
    return sire?.name || "Unknown";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Puppy Portal - Litter Management</h1>
        </div>

      {litters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Crown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Litters Found</h3>
            <p className="text-gray-500 mb-4">
              Create your first litter when adding puppies to the system.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {litters.map((litter) => (
            <Card key={litter.id} className="border-l-4 border-l-orange-400">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <Crown className="h-6 w-6 text-orange-600" />
                  <div>
                    <CardTitle className="text-xl text-gray-900">{litter.name}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>Born: {new Date(litter.dateOfBirth).toLocaleDateString()}</span>
                      <Badge variant={litter.isActive ? "default" : "secondary"}>
                        {litter.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(litter)}
                  data-testid={`button-edit-litter-${litter.id}`}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Dam (Mother):</span>
                    <span className="ml-2 text-gray-600">{getDamName(litter.damId)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sire (Father):</span>
                    <span className="ml-2 text-gray-600">{getSireName(litter.sireId)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Litter Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="z-[100]" style={{ zIndex: 100 }}>
          <DialogHeader>
            <DialogTitle>Edit Litter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Litter Name *</label>
              <Input
                placeholder="e.g., Pippa x Po Litter, Spring 2024 Litter"
                value={litterName}
                onChange={(e) => setLitterName(e.target.value)}
                data-testid="input-edit-litter-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date of Birth *</label>
              <Input
                type="date"
                value={litterDateOfBirth}
                onChange={(e) => setLitterDateOfBirth(e.target.value)}
                data-testid="input-edit-litter-dob"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Dam (Mother)</label>
              <Select onValueChange={setLitterDamId} value={litterDamId}>
                <SelectTrigger data-testid="select-edit-litter-dam">
                  <SelectValue placeholder="Select dam..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {parentDogs.filter(dog => dog.gender === 'female').map((dog) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Sire (Father)</label>
              <Select onValueChange={setLitterSireId} value={litterSireId}>
                <SelectTrigger data-testid="select-edit-litter-sire">
                  <SelectValue placeholder="Select sire..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {parentDogs.filter(dog => dog.gender === 'male').map((dog) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select onValueChange={(value) => setLitterIsActive(value === 'true')} value={litterIsActive.toString()}>
                <SelectTrigger data-testid="select-edit-litter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                  setShowEditDialog(false);
                  resetForm();
                }}
                data-testid="button-cancel-edit-litter"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={updateLitterMutation.isPending}
                data-testid="button-save-edit-litter"
              >
                {updateLitterMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}