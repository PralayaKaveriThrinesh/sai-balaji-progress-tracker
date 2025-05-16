
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  getAllVehicles, 
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '@/lib/storage';
import { Vehicle } from '@/lib/types';

const AdminVehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Form states
  const [newVehicleData, setNewVehicleData] = useState({
    model: '',
    registrationNumber: '',
    pollutionCertificate: '',
    fitnessCertificate: '',
    additionalDetails: ''
  });
  
  const [editVehicleData, setEditVehicleData] = useState({
    model: '',
    registrationNumber: '',
    pollutionCertificate: '',
    fitnessCertificate: '',
    additionalDetails: ''
  });
  
  useEffect(() => {
    // Fetch all vehicles
    const allVehicles = getAllVehicles();
    setVehicles(allVehicles);
    setFilteredVehicles(allVehicles);
  }, []);
  
  // Filter vehicles based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredVehicles(vehicles);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = vehicles.filter(
      vehicle => 
        vehicle.model.toLowerCase().includes(term) || 
        vehicle.registrationNumber.toLowerCase().includes(term)
    );
    
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);
  
  const handleAddVehicle = () => {
    // Validate form
    if (!newVehicleData.model || !newVehicleData.registrationNumber) {
      toast.error("Vehicle model and registration number are required");
      return;
    }
    
    try {
      // Check if registration number already exists
      if (vehicles.some(v => v.registrationNumber === newVehicleData.registrationNumber)) {
        toast.error("A vehicle with this registration number already exists");
        return;
      }
      
      // Create new vehicle
      const createdVehicle = createVehicle({
        model: newVehicleData.model,
        registrationNumber: newVehicleData.registrationNumber,
        pollutionCertificate: newVehicleData.pollutionCertificate,
        fitnessCertificate: newVehicleData.fitnessCertificate,
        additionalDetails: newVehicleData.additionalDetails
      });
      
      // Update state
      setVehicles([...vehicles, createdVehicle]);
      
      // Close dialog and reset form
      setShowAddDialog(false);
      setNewVehicleData({
        model: '',
        registrationNumber: '',
        pollutionCertificate: '',
        fitnessCertificate: '',
        additionalDetails: ''
      });
      
      toast.success("Vehicle added successfully");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle");
    }
  };
  
  const handleEditVehicle = () => {
    if (!selectedVehicle) return;
    
    // Validate form
    if (!editVehicleData.model || !editVehicleData.registrationNumber) {
      toast.error("Vehicle model and registration number are required");
      return;
    }
    
    try {
      // Check if registration number already exists for another vehicle
      if (vehicles.some(v => 
        v.registrationNumber === editVehicleData.registrationNumber && 
        v.id !== selectedVehicle.id
      )) {
        toast.error("Another vehicle with this registration number already exists");
        return;
      }
      
      // Update vehicle
      const updatedVehicle = updateVehicle({
        ...selectedVehicle,
        model: editVehicleData.model,
        registrationNumber: editVehicleData.registrationNumber,
        pollutionCertificate: editVehicleData.pollutionCertificate,
        fitnessCertificate: editVehicleData.fitnessCertificate,
        additionalDetails: editVehicleData.additionalDetails
      });
      
      // Update state
      setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
      
      // Close dialog
      setShowEditDialog(false);
      setSelectedVehicle(null);
      
      toast.success("Vehicle updated successfully");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle");
    }
  };
  
  const handleDeleteVehicle = () => {
    if (!selectedVehicle) return;
    
    try {
      // Delete vehicle
      deleteVehicle(selectedVehicle.id);
      
      // Update state
      setVehicles(vehicles.filter(v => v.id !== selectedVehicle.id));
      
      // Close dialog
      setShowDeleteDialog(false);
      setSelectedVehicle(null);
      
      toast.success("Vehicle deleted successfully");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
    }
  };
  
  const openEditDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditVehicleData({
      model: vehicle.model,
      registrationNumber: vehicle.registrationNumber,
      pollutionCertificate: vehicle.pollutionCertificate || '',
      fitnessCertificate: vehicle.fitnessCertificate || '',
      additionalDetails: vehicle.additionalDetails || ''
    });
    setShowEditDialog(true);
  };
  
  const openDeleteDialog = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteDialog(true);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Vehicle Management</h1>
      <p className="text-muted-foreground mb-8">
        Manage vehicles, registration details and certification information.
      </p>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="w-full md:w-60">
          <Label htmlFor="search-vehicles" className="mb-1 block">Search Vehicles</Label>
          <Input
            id="search-vehicles"
            placeholder="Search by model or reg. no."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="mt-4 md:mt-auto">
          <Button onClick={() => setShowAddDialog(true)}>
            Add New Vehicle
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader>
              <CardTitle>{vehicle.model}</CardTitle>
              <CardDescription>
                Reg. No: {vehicle.registrationNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vehicle.pollutionCertificate && (
                  <div>
                    <p className="text-sm font-medium">Pollution Certificate:</p>
                    <p className="text-sm text-muted-foreground">{vehicle.pollutionCertificate}</p>
                  </div>
                )}
                
                {vehicle.fitnessCertificate && (
                  <div>
                    <p className="text-sm font-medium">Fitness Certificate:</p>
                    <p className="text-sm text-muted-foreground">{vehicle.fitnessCertificate}</p>
                  </div>
                )}
                
                {vehicle.additionalDetails && (
                  <div>
                    <p className="text-sm font-medium">Additional Details:</p>
                    <p className="text-sm text-muted-foreground">{vehicle.additionalDetails}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => openEditDialog(vehicle)}
              >
                Edit
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => openDeleteDialog(vehicle)}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {filteredVehicles.length === 0 && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No Vehicles Found</CardTitle>
              <CardDescription>
                No vehicles match your search criteria.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
      
      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>
              Enter the details of the new vehicle
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-model">Vehicle Model *</Label>
              <Input
                id="new-model"
                placeholder="e.g. Tata ACE"
                value={newVehicleData.model}
                onChange={(e) => setNewVehicleData({...newVehicleData, model: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-reg-no">Registration Number *</Label>
              <Input
                id="new-reg-no"
                placeholder="e.g. MH01AB1234"
                value={newVehicleData.registrationNumber}
                onChange={(e) => setNewVehicleData({...newVehicleData, registrationNumber: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-pollution">Pollution Certificate</Label>
              <Input
                id="new-pollution"
                placeholder="Certificate number or validity date"
                value={newVehicleData.pollutionCertificate}
                onChange={(e) => setNewVehicleData({...newVehicleData, pollutionCertificate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-fitness">Fitness Certificate</Label>
              <Input
                id="new-fitness"
                placeholder="Certificate number or validity date"
                value={newVehicleData.fitnessCertificate}
                onChange={(e) => setNewVehicleData({...newVehicleData, fitnessCertificate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-details">Additional Details</Label>
              <Input
                id="new-details"
                placeholder="Any other information"
                value={newVehicleData.additionalDetails}
                onChange={(e) => setNewVehicleData({...newVehicleData, additionalDetails: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVehicle}>
              Add Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Vehicle Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update vehicle details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-model">Vehicle Model *</Label>
              <Input
                id="edit-model"
                placeholder="e.g. Tata ACE"
                value={editVehicleData.model}
                onChange={(e) => setEditVehicleData({...editVehicleData, model: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-reg-no">Registration Number *</Label>
              <Input
                id="edit-reg-no"
                placeholder="e.g. MH01AB1234"
                value={editVehicleData.registrationNumber}
                onChange={(e) => setEditVehicleData({...editVehicleData, registrationNumber: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-pollution">Pollution Certificate</Label>
              <Input
                id="edit-pollution"
                placeholder="Certificate number or validity date"
                value={editVehicleData.pollutionCertificate}
                onChange={(e) => setEditVehicleData({...editVehicleData, pollutionCertificate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-fitness">Fitness Certificate</Label>
              <Input
                id="edit-fitness"
                placeholder="Certificate number or validity date"
                value={editVehicleData.fitnessCertificate}
                onChange={(e) => setEditVehicleData({...editVehicleData, fitnessCertificate: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-details">Additional Details</Label>
              <Input
                id="edit-details"
                placeholder="Any other information"
                value={editVehicleData.additionalDetails}
                onChange={(e) => setEditVehicleData({...editVehicleData, additionalDetails: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditVehicle}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Vehicle Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div><strong>Model:</strong> {selectedVehicle.model}</div>
                <div><strong>Registration:</strong> {selectedVehicle.registrationNumber}</div>
                {selectedVehicle.pollutionCertificate && (
                  <div><strong>Pollution Certificate:</strong> {selectedVehicle.pollutionCertificate}</div>
                )}
                {selectedVehicle.fitnessCertificate && (
                  <div><strong>Fitness Certificate:</strong> {selectedVehicle.fitnessCertificate}</div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVehicle}>
              Delete Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVehicles;
