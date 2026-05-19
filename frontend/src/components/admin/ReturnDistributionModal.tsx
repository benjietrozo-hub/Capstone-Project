import { useState } from 'react';
import { X, Calendar, FileText, CheckCircle, Package, User, Info, ArrowLeft } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ReturnDistributionModalProps {
  distribution: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReturnDistributionModal({ distribution, onClose, onSuccess }: ReturnDistributionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    actual_return_date: new Date().toISOString().split('T')[0],
    condition_on_return: 'good',
    admin_notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axiosInstance.post(`/admin/distributions/${distribution.id}/return`, formData);

      toast.success('Distribution marked as returned successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark as returned');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="p-3 bg-white/20 rounded-sm backdrop-blur-md">
              <ArrowLeft className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Return Asset</h2>
              <p className="text-emerald-50 text-sm opacity-90">Process the return of distributed items</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-8">
            {/* Distribution Summary Card */}
            <div className="bg-gray-50/50 rounded border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-sm uppercase tracking-wider">
                <Info className="w-4 h-4 text-emerald-600" />
                Distribution Details
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Item Name</span>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-bold text-gray-900">{distribution.item.item_name}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Recipient</span>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-bold text-gray-900">{distribution.teacher.full_name}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Quantity</span>
                  <p className="text-sm font-bold text-gray-900">{distribution.quantity_distributed} Units</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Original Condition</span>
                  <Badge variant="outline" className="capitalize font-bold bg-white text-emerald-700 border-emerald-100">
                    {distribution.condition_on_distribution}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Issue Date</span>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(distribution.distribution_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>

                {distribution.expected_return_date && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Expected Return</span>
                    <p className="text-sm font-bold text-emerald-600">
                      {new Date(distribution.expected_return_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Return Date */}
                <div className="space-y-3">
                  <Label htmlFor="actual_return_date" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Actual Return Date *
                  </Label>
                  <Input
                    id="actual_return_date"
                    type="date"
                    value={formData.actual_return_date}
                    onChange={(e) => setFormData({ ...formData, actual_return_date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-12 rounded-sm border-gray-200 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Condition on Return */}
                <div className="space-y-3">
                  <Label htmlFor="condition_on_return" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Condition on Return *
                  </Label>
                  <Select 
                    value={formData.condition_on_return} 
                    onValueChange={(value) => setFormData({ ...formData, condition_on_return: value })}
                  >
                    <SelectTrigger className="h-12 rounded-sm border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm border-gray-100">
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-3">
                <Label htmlFor="admin_notes" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Processing Notes
                </Label>
                <Textarea
                  id="admin_notes"
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  placeholder="Any observations regarding the item's condition or return status..."
                  rows={4}
                  className="rounded border-gray-200 focus:ring-emerald-500 p-4 min-h-[120px]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose} 
                  className="flex-1 font-bold h-12 rounded-sm text-gray-500"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:shadow-emerald-100 transition-all font-bold h-12 rounded-sm px-12"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Complete Return"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

