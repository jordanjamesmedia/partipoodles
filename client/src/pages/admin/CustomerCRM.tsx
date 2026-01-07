import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/AdminSidebar";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Eye, Edit, Phone } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

// Convex data type
interface ConvexCustomer {
  _id: Id<"customers">;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: string;
  last_contact_date?: string;
  created_at?: string;
  updated_at?: string;
}

export default function CustomerCRM() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState<ConvexCustomer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "prospective",
    notes: "",
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Convex queries and mutations
  const customersData = useQuery(api.customers.list);
  const createCustomer = useMutation(api.customers.create);
  const updateCustomer = useMutation(api.customers.update);

  const customers: ConvexCustomer[] = customersData ?? [];
  const customersLoading = customersData === undefined;

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      status: "prospective",
      notes: "",
    });
  };

  const handleEdit = (customer: ConvexCustomer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address || "",
      status: customer.status || "prospective",
      notes: customer.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleView = (customer: ConvexCustomer) => {
    setSelectedCustomer(customer);
    setIsViewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (selectedCustomer) {
        await updateCustomer({
          id: selectedCustomer._id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          status: formData.status,
          notes: formData.notes || undefined,
          last_contact_date: new Date().toISOString(),
        });
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        await createCustomer({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          status: formData.status,
          notes: formData.notes || undefined,
        });
        toast({
          title: "Success",
          description: "Customer created successfully",
        });
      }
      handleFormClose();
    } catch (error: any) {
      console.error('Customer error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save customer",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeClass = (status: string | undefined) => {
    switch (status) {
      case 'prospective':
        return 'status-badge bg-blue-100 text-blue-800';
      case 'current':
        return 'status-badge bg-green-100 text-green-800';
      case 'past':
        return 'status-badge bg-gray-100 text-gray-800';
      default:
        return 'status-badge';
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <AdminSidebar />

        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800" data-testid="text-crm-title">Puppy Portal - Customer CRM</h1>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary" data-testid="button-add-customer">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl z-[100]" style={{ zIndex: 100 }}>
                <DialogHeader>
                  <DialogTitle>
                    {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        data-testid="input-customer-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        data-testid="input-customer-email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        data-testid="input-customer-phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        data-testid="input-customer-address"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger data-testid="select-customer-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospective">Prospective</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      data-testid="textarea-customer-notes"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={handleFormClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      data-testid="button-save-customer"
                    >
                      {selectedCustomer ? 'Update' : 'Create'} Customer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : customers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Contact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer._id}>
                          <TableCell>
                            <div className="font-medium" data-testid={`text-customer-name-${customer._id}`}>
                              {customer.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div data-testid={`text-customer-email-${customer._id}`}>
                                {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="text-gray-500" data-testid={`text-customer-phone-${customer._id}`}>
                                  {customer.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell data-testid={`text-customer-address-${customer._id}`}>
                            {customer.address || '-'}
                          </TableCell>
                          <TableCell>
                            <span className={getStatusBadgeClass(customer.status)} data-testid={`text-customer-status-${customer._id}`}>
                              {customer.status || 'prospective'}
                            </span>
                          </TableCell>
                          <TableCell data-testid={`text-customer-last-contact-${customer._id}`}>
                            {customer.last_contact_date
                              ? new Date(customer.last_contact_date).toLocaleDateString()
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(customer)}
                                data-testid={`button-view-customer-${customer._id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(customer)}
                                data-testid={`button-edit-customer-${customer._id}`}
                              >
                                <Edit className="h-4 w-4" />
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
                  <p className="text-gray-500 mb-4">No customers found</p>
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="btn-primary"
                    data-testid="button-add-first-customer"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Add Your First Customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer View Dialog */}
          <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Customer Details</DialogTitle>
              </DialogHeader>
              {selectedCustomer && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p>{selectedCustomer.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p>{selectedCustomer.phone || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Address</Label>
                      <p>{selectedCustomer.address || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <span className={getStatusBadgeClass(selectedCustomer.status)}>
                        {selectedCustomer.status || 'prospective'}
                      </span>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Contact</Label>
                      <p>
                        {selectedCustomer.last_contact_date
                          ? new Date(selectedCustomer.last_contact_date).toLocaleDateString()
                          : '-'
                        }
                      </p>
                    </div>
                  </div>

                  {selectedCustomer.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Notes</Label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedCustomer.notes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Created</Label>
                      <p>{selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Updated</Label>
                      <p>{selectedCustomer.updated_at ? new Date(selectedCustomer.updated_at).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsViewOpen(false);
                        handleEdit(selectedCustomer);
                      }}
                    >
                      Edit Customer
                    </Button>
                    {selectedCustomer.phone && (
                      <Button
                        onClick={() => window.open(`tel:${selectedCustomer.phone}`, '_self')}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Call Customer
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
