
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  getAllDrivers, 
  createDriver,
  updateDriver,
  deleteDriver
} from '@/lib/storage';
import { Driver } from '@/lib/types';

const AdminDrivers = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  
  // Form states
  const [newDriverData, setNewDriverData] = useState({
    name: '',
    licenseNumber: '',
    licenseType: 'LMV',
    experienceYears: '0',
    contactNumber: '',
    address: ''
  });
  
  const [editDriverData, setEditDriverData] = useState({
    name: '',
    licenseNumber: '',
    licenseType: '',
    experienceYears: '',
    contactNumber: '',
    address: ''
  });
  
  useEffect(() => {
    // Fetch all drivers
    const allDrivers = getAllDrivers();
    setDrivers(allDrivers);
    setFilteredDrivers(allDrivers);
  }, []);
  
  // Filter drivers based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredDrivers(drivers);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = drivers.filter(
      driver => 
        driver.name.toLowerCase().includes(term) || 
        driver.licenseNumber.toLowerCase().includes(term)
    );
    
    setFilteredDrivers(filtered);
  }, [searchTerm, drivers]);
  
  const handleAddDriver = () => {
    // Validate form
    if (!newDriverData.name || !newDriverData.licenseNumber) {
      toast.error("Driver name and license number are required");
      return;
    }
    
    try {
      // Check if license number already exists
      if (drivers.some(d => d.licenseNumber === newDriverData.licenseNumber)) {
        toast.error("A driver with this license number already exists");
        return;
      }
      
      // Create new driver
      const createdDriver = createDriver({
        name: newDriverData.name,
        licenseNumber: newDriverData.licenseNumber,
        licenseType: newDriverData.licenseType,
        experienceYears: parseInt(newDriverData.experienceYears),
        contactNumber: newDriverData.contactNumber,
        address: newDriverData.address
      });
      
      // Update state
      setDrivers([...drivers, createdDriver]);
      
      // Close dialog and reset form
      setShowAddDialog(false);
      setNewDriverData({
        name: '',
        licenseNumber: '',
        licenseType: 'LMV',
        experienceYears: '0',
        contactNumber: '',
        address: ''
      });
      
      toast.success("Driver added successfully");
    } catch (error) {
      console.error("Error adding driver:", error);
      toast.error("Failed to add driver");
    }
  };
  
  const handleEditDriver = () => {
    if (!selectedDriver) return;
    
    // Validate form
    if (!editDriverData.name || !editDriverData.licenseNumber) {
      toast.error("Driver name and license number are required");
      return;
    }
    
    try {
      // Check if license number already exists for another driver
      if (drivers.some(d => 
        d.licenseNumber === editDriverData.licenseNumber && 
        d.id !== selectedDriver.id
      )) {
        toast.error("Another driver with this license number already exists");
        return;
      }
      
      // Update driver
      const updatedDriver = updateDriver({
        ...selectedDriver,
        name: editDriverData.name,
        licenseNumber: editDriverData.licenseNumber,
        licenseType: editDriverData.licenseType,
        experienceYears: parseInt(editDriverData.experienceYears),
        contactNumber: editDriverData.contactNumber,
        address: editDriverData.address
      });
      
      // Update state
      setDrivers(drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d));
      
      // Close dialog
      setShowEditDialog(false);
      setSelectedDriver(null);
      
      toast.success("Driver updated successfully");
    } catch (error) {
      console.error("Error updating driver:", error);
      toast.error("Failed to update driver");
    }
  };
  
  const handleDeleteDriver = () => {
    if (!selectedDriver) return;
    
    try {
      // Delete driver
      deleteDriver(selectedDriver.id);
      
      // Update state
      setDrivers(drivers.filter(d => d.id !== selectedDriver.id));
      
      // Close dialog
      setShowDeleteDialog(false);
      setSelectedDriver(null);
      
      toast.success("Driver deleted successfully");
    } catch (error) {
      console.error("Error deleting driver:", error);
      toast.error("Failed to delete driver");
    }
  };
  
  const openEditDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditDriverData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      experienceYears: driver.experienceYears.toString(),
      contactNumber: driver.contactNumber || '',
      address: driver.address || ''
    });
    setShowEditDialog(true);
  };
  
  const openDeleteDialog = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDeleteDialog(true);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Driver Management</h1>
      <p className="text-muted-foreground mb-8">
        Manage drivers, their licenses, and experience details.
      </p>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="w-full md:w-60">
          <Label htmlFor="search-drivers" className="mb-1 block">Search Drivers</Label>
          <Input
            id="search-drivers"
            placeholder="Search by name or license no."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="mt-4 md:mt-auto">
          <Button onClick={() => setShowAddDialog(true)}>
            Add New Driver
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id}>
            <CardHeader>
              <CardTitle>{driver.name}</CardTitle>
              <CardDescription>
                License: {driver.licenseNumber} ({driver.licenseType})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Experience:</p>
                  <p className="text-sm text-muted-foreground">{driver.experienceYears} years</p>
                </div>
                
                {driver.contactNumber && (
                  <div>
                    <p className="text-sm font-medium">Contact:</p>
                    <p className="text-sm text-muted-foreground">{driver.contactNumber}</p>
                  </div>
                )}
                
                {driver.address && (
                  <div>
                    <p className="text-sm font-medium">Address:</p>
                    <p className="text-sm text-muted-foreground">{driver.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => openEditDialog(driver)}
              >
                Edit
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => openDeleteDialog(driver)}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {filteredDrivers.length === 0 && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No Drivers Found</CardTitle>
              <CardDescription>
                No drivers match your search criteria.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
      
      {/* Add Driver Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>
              Enter the details of the new driver
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Driver Name *</Label>
              <Input
                id="new-name"
                placeholder="Full name"
                value={newDriverData.name}
                onChange={(e) => setNewDriverData({...newDriverData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-license">License Number *</Label>
              <Input
                id="new-license"
                placeholder="e.g. DL-1234567890"
                value={newDriverData.licenseNumber}
                onChange={(e) => setNewDriverData({...newDriverData, licenseNumber: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-license-type">License Type</Label>
              <Select
                value={newDriverData.licenseType}
                onValueChange={(value) => setNewDriverData({...newDriverData, licenseType: value})}
              >
                <SelectTrigger id="new-license-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LMV">LMV (Light Motor Vehicle)</SelectItem>
                  <SelectItem value="HMV">HMV (Heavy Motor Vehicle)</SelectItem>
                  <SelectItem value="MCWG">MCWG (Motorcycle with Gear)</SelectItem>
                  <SelectItem value="MCWOG">MCWOG (Motorcycle without Gear)</SelectItem>
                  <SelectItem value="HGMV">HGMV (Heavy Goods Motor Vehicle)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-experience">Experience (Years)</Label>
              <Input
                id="new-experience"
                type="number"
                min="0"
                placeholder="Years of experience"
                value={newDriverData.experienceYears}
                onChange={(e) => setNewDriverData({...newDriverData, experienceYears: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-contact">Contact Number</Label>
              <Input
                id="new-contact"
                placeholder="Phone number"
                value={newDriverData.contactNumber}
                onChange={(e) => setNewDriverData({...newDriverData, contactNumber: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-address">Address</Label>
              <Input
                id="new-address"
                placeholder="Residential address"
                value={newDriverData.address}
                onChange={(e) => setNewDriverData({...newDriverData, address: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDriver}>
              Add Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Driver Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>
              Update driver details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Driver Name *</Label>
              <Input
                id="edit-name"
                placeholder="Full name"
                value={editDriverData.name}
                onChange={(e) => setEditDriverData({...editDriverData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-license">License Number *</Label>
              <Input
                id="edit-license"
                placeholder="e.g. DL-1234567890"
                value={editDriverData.licenseNumber}
                onChange={(e) => setEditDriverData({...editDriverData, licenseNumber: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-license-type">License Type</Label>
              <Select
                value={editDriverData.licenseType}
                onValueChange={(value) => setEditDriverData({...editDriverData, licenseType: value})}
              >
                <SelectTrigger id="edit-license-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LMV">LMV (Light Motor Vehicle)</SelectItem>
                  <SelectItem value="HMV">HMV (Heavy Motor Vehicle)</SelectItem>
                  <SelectItem value="MCWG">MCWG (Motorcycle with Gear)</SelectItem>
                  <SelectItem value="MCWOG">MCWOG (Motorcycle without Gear)</SelectItem>
                  <SelectItem value="HGMV">HGMV (Heavy Goods Motor Vehicle)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-experience">Experience (Years)</Label>
              <Input
                id="edit-experience"
                type="number"
                min="0"
                placeholder="Years of experience"
                value={editDriverData.experienceYears}
                onChange={(e) => setEditDriverData({...editDriverData, experienceYears: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-contact">Contact Number</Label>
              <Input
                id="edit-contact"
                placeholder="Phone number"
                value={editDriverData.contactNumber}
                onChange={(e) => setEditDriverData({...editDriverData, contactNumber: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                placeholder="Residential address"
                value={editDriverData.address}
                onChange={(e) => setEditDriverData({...editDriverData, address: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDriver}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Driver Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Driver</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this driver? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDriver && (
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div><strong>Name:</strong> {selectedDriver.name}</div>
                <div><strong>License:</strong> {selectedDriver.licenseNumber} ({selectedDriver.licenseType})</div>
                <div><strong>Experience:</strong> {selectedDriver.experienceYears} years</div>
                {selectedDriver.contactNumber && (
                  <div><strong>Contact:</strong> {selectedDriver.contactNumber}</div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDriver}>
              Delete Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDrivers;
