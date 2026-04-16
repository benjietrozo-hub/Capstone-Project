// Simple test to verify sonner toast is working
import { toast } from 'sonner';

// Test different toast types
console.log('Testing toast system...');

// Test success toast
toast.success('This is a success message!');

// Test error toast  
toast.error('This is an error message!');

// Test info toast
toast.info('This is an info message!');

console.log('Toast test completed');
