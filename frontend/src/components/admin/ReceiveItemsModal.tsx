import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';

interface ReceiveItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  poId: number;
  onSuccess: () => void;
}

const ReceiveItemsModal: React.FC<ReceiveItemsModalProps> = ({
  isOpen,
  onClose,
  poId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [po, setPO] = useState<any>(null);
  const [receivedQuantities, setReceivedQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (isOpen && poId) {
      fetchPODetails();
    }
  }, [isOpen, poId]);

  const fetchPODetails = async () => {
    try {
      const response = await axios.get(`/admin/purchase-orders/${poId}`);
      setPO(response.data);
      
      // Initialize received quantities
      const initialQuantities: { [key: number]: number } = {};
      response.data.items?.forEach((item: any) => {
        initialQuantities[item.id] = 0;
      });
      setReceivedQuantities(initialQuantities);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch purchase order details');
    }
  };

  const handleQuantityChange = (itemId: number, value: number) => {
    setReceivedQuantities({
      ...receivedQuantities,
      [itemId]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const items = Object.entries(receivedQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, quantity_received]) => ({
        id: parseInt(id),
        quantity_received,
      }));

    if (items.length === 0) {
      toast.error('Please enter at least one quantity to receive');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/admin/purchase-orders/${poId}/receive`, { items });
      toast.success('Items received successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to receive items');
    } finally {
      setLoading(false);
    }
  };

  if (!po) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center py-8">
            <p>Loading...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receive Items - {po.po_number}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Item
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Ordered
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Already Received
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Remaining
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Receive Now
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {po.items?.map((item: any) => {
                  const remaining = item.quantity_ordered - item.quantity_received;
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.item_name}</p>
                        {item.item_code && (
                          <p className="text-xs text-gray-500">{item.item_code}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.quantity_ordered} {item.unit_of_measure}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.quantity_received} {item.unit_of_measure}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {remaining} {item.unit_of_measure}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          max={remaining}
                          value={receivedQuantities[item.id] || 0}
                          onChange={(e) =>
                            handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                          }
                          className="w-24 mx-auto"
                          disabled={remaining === 0}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Receiving...' : 'Receive Items'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveItemsModal;
