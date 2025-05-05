
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function AddCustomTrainingType() {
  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start font-normal mt-2"
      onClick={() => {
        // This is a stub - will be implemented later
        console.log('Add custom training type');
      }}
    >
      <Plus className="mr-2 h-4 w-4" />
      <span>Add New Type</span>
    </Button>
  );
}
