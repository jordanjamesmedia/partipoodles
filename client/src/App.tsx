import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Puppies from "@/pages/Puppies";
import PuppyDetails from "@/pages/PuppyDetails";
import Gallery from "@/pages/Gallery";
import Parents from "@/pages/Parents";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import Dashboard from "@/pages/admin/Dashboard";
import ManagePuppies from "@/pages/admin/ManagePuppies";
import ManageParentDogs from "@/pages/admin/ManageParentDogs";
import ManageLitters from "@/pages/admin/ManageLitters";
import CustomerInquiries from "@/pages/admin/CustomerInquiries";
import PhotoGallery from "@/pages/admin/PhotoGallery";
import CustomerCRM from "@/pages/admin/CustomerCRM";
import AdminProfile from "@/pages/AdminProfile";

// Component to scroll to top on route change
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/puppies" component={Puppies} />
        <Route path="/puppy/:id" component={PuppyDetails} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/parents" component={Parents} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin-login" component={AdminLogin} />
        
        {/* Admin routes - authentication handled within components */}
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/dashboard" component={Dashboard} />
        <Route path="/admin/puppies" component={ManagePuppies} />
        <Route path="/admin/parent-dogs" component={ManageParentDogs} />
        <Route path="/admin/litters" component={ManageLitters} />
        <Route path="/admin/inquiries" component={CustomerInquiries} />
        <Route path="/admin/gallery" component={PhotoGallery} />
        <Route path="/admin/customers" component={CustomerCRM} />
        <Route path="/admin/profile" component={AdminProfile} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
