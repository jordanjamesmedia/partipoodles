import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Mail, Users, Images } from "lucide-react";

export default function Dashboard() {
  const puppies = useQuery(api.puppies.list);
  const inquiries = useQuery(api.inquiries.list);
  const customers = useQuery(api.customers.list);
  const galleryPhotos = useQuery(api.galleryPhotos.list);

  const statsLoading = puppies === undefined || inquiries === undefined || customers === undefined || galleryPhotos === undefined;
  const inquiriesLoading = inquiries === undefined;

  const availablePuppies = puppies?.filter(p => p.status === "available").length || 0;
  const pendingInquiries = inquiries?.filter(i => i.status === "new").length || 0;
  const totalCustomers = customers?.length || 0;
  const totalGalleryPhotos = galleryPhotos?.length || 0;

  const recentInquiriesSlice = (inquiries || []).slice(0, 5);

  return (
    <AdminLayout>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8" data-testid="text-dashboard-title">Puppy Portal Overview</h1>
          
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Available Puppies</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-primary" data-testid="text-available-puppies">
                        {availablePuppies}
                      </p>
                    )}
                  </div>
                  <div className="bg-primary/20 p-3 rounded-lg">
                    <Heart className="text-primary h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Pending Inquiries</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-secondary" data-testid="text-pending-inquiries">
                        {pendingInquiries}
                      </p>
                    )}
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <Mail className="text-secondary h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Total Customers</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-green-600" data-testid="text-total-customers">
                        {totalCustomers}
                      </p>
                    )}
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Photos in Gallery</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-purple-600" data-testid="text-gallery-photos">
                        {totalGalleryPhotos}
                      </p>
                    )}
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Images className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
            {/* Recent Inquiries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                {inquiriesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-3">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recentInquiriesSlice.length > 0 ? (
                  <div className="space-y-4">
                    {recentInquiriesSlice.map((inquiry) => (
                      <div key={inquiry._id} className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-semibold" data-testid={`text-customer-${inquiry._id}`}>
                            {inquiry.customer_name}
                          </p>
                          <p className="text-sm text-gray-600 truncate max-w-xs" data-testid={`text-inquiry-${inquiry._id}`}>
                            {inquiry.message}
                          </p>
                        </div>
                        <span className={`status-badge status-${inquiry.status}`}>
                          {inquiry.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent inquiries</p>
                )}
              </CardContent>
            </Card>
            
            {/* Puppy Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Puppy Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Available</span>
                    <span className="status-badge status-available">
                      {availablePuppies} puppies
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Reserved</span>
                    <span className="status-badge status-reserved">
                      0 puppies
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sold</span>
                    <span className="status-badge status-sold">
                      0 puppies
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
      </div>
    </AdminLayout>
  );
}
