import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Trash2, Eye, Phone, Mail, MessageSquare, RotateCcw } from "lucide-react";
import type { Inquiry } from "@shared/schema";

export default function CustomerInquiries() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

  const { data: inquiries = [], isLoading: inquiriesLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
    enabled: !!isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Inquiry> }) => {
      await apiRequest("PUT", `/api/admin/inquiries/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
      toast({
        title: "Success",
        description: "Inquiry updated successfully",
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
        description: "Failed to update inquiry",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/inquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
      toast({
        title: "Success",
        description: "Inquiry deleted successfully",
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
        description: "Failed to delete inquiry",
        variant: "destructive",
      });
    },
  });


  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: 'pending' | 'responded' | 'resolved') => {
    updateMutation.mutate({
      id,
      data: { status: newStatus },
    });
  };

  const handleMarkResolved = (id: string) => {
    updateMutation.mutate({
      id,
      data: { status: 'resolved' },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this inquiry?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'responded':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'resolved':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'New Lead';
      case 'responded':
        return 'Contacted';
      case 'resolved':
        return 'Closed';
      default:
        return status;
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8" data-testid="text-inquiries-title">Customer Inquiries</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>All Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              {inquiriesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-64" />
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
              ) : inquiries.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Inquiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell data-testid={`text-inquiry-date-${inquiry.id}`}>
                            {new Date(inquiry.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium" data-testid={`text-customer-name-${inquiry.id}`}>
                              {inquiry.customerName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div data-testid={`text-customer-email-${inquiry.id}`}>
                                {inquiry.email}
                              </div>
                              {inquiry.phone && (
                                <div className="text-gray-500" data-testid={`text-customer-phone-${inquiry.id}`}>
                                  {inquiry.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate cursor-pointer hover:text-blue-600" 
                                 onClick={() => handleViewDetails(inquiry)}
                                 data-testid={`text-inquiry-message-${inquiry.id}`}>
                              {inquiry.message}
                            </div>
                            {inquiry.puppyInterest && (
                              <div className="text-sm text-gray-500">
                                Interested in: {inquiry.puppyInterest}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={getStatusBadgeClass(inquiry.status)} data-testid={`text-inquiry-status-${inquiry.id}`}>
                              {getStatusLabel(inquiry.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(inquiry)}
                                data-testid={`button-view-${inquiry.id}`}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {inquiry.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(inquiry.id, 'responded')}
                                  disabled={updateMutation.isPending}
                                  data-testid={`button-contacted-${inquiry.id}`}
                                  title="Mark as Contacted"
                                >
                                  <Phone className="h-4 w-4" />
                                </Button>
                              )}
                              {inquiry.status === 'resolved' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(inquiry.id, 'pending')}
                                  disabled={updateMutation.isPending}
                                  data-testid={`button-reopen-${inquiry.id}`}
                                  title="Reopen Lead"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarkResolved(inquiry.id)}
                                  disabled={updateMutation.isPending}
                                  data-testid={`button-resolve-${inquiry.id}`}
                                  title="Mark as Closed"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(inquiry.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-inquiry-${inquiry.id}`}
                                title="Delete Inquiry"
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
                  <p className="text-gray-500">No inquiries found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inquiry Details Dialog */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Inquiry Details</DialogTitle>
              </DialogHeader>
              {selectedInquiry && (
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Name</label>
                        <p className="text-gray-900">{selectedInquiry.customerName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900">{selectedInquiry.email}</p>
                          <a 
                            href={`mailto:${selectedInquiry.email}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                      {selectedInquiry.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Phone</label>
                          <p className="text-gray-900">{selectedInquiry.phone}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date Submitted</label>
                        <p className="text-gray-900">{new Date(selectedInquiry.createdAt!).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Inquiry Details */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Inquiry Message</h3>
                    <div className="bg-white border rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                    </div>
                    {selectedInquiry.puppyInterest && (
                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-600">Puppy Interest</label>
                        <p className="text-gray-900">{selectedInquiry.puppyInterest}</p>
                      </div>
                    )}
                  </div>

                  {/* Current Status */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Lead Status</h3>
                    <div className="flex items-center gap-3">
                      <span className={getStatusBadgeClass(selectedInquiry.status)}>
                        {getStatusLabel(selectedInquiry.status)}
                      </span>
                      <div className="flex gap-2">
                        {selectedInquiry.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleStatusChange(selectedInquiry.id, 'responded');
                              setIsDetailOpen(false);
                            }}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <Phone className="h-4 w-4" />
                            Mark as Contacted
                          </Button>
                        )}
                        {selectedInquiry.status === 'responded' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleStatusChange(selectedInquiry.id, 'pending');
                              setIsDetailOpen(false);
                            }}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Mark as New Lead
                          </Button>
                        )}
                        {selectedInquiry.status === 'resolved' ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              handleStatusChange(selectedInquiry.id, 'pending');
                              setIsDetailOpen(false);
                            }}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Reopen Lead
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              handleMarkResolved(selectedInquiry.id);
                              setIsDetailOpen(false);
                            }}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Close Lead
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDelete(selectedInquiry.id);
                        setIsDetailOpen(false);
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Inquiry
                    </Button>
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
