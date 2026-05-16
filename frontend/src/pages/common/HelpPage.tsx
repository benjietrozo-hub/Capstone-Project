import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, HelpCircle, Package, UserCheck, ShieldCheck, Mail, Info, ChevronDown, Edit, Save, Plus, Trash2, X } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { settingsAPI } from '@/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/common/FormElements';

interface FAQ {
  question: string;
  answer: string;
}

const CustomAccordionItem = ({ title, children, isOpen, onToggle }: { title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) => {
  return (
    <div className="border-b border-gray-100 last:border-none">
      <button 
        onClick={onToggle}
        className="w-full py-5 px-6 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors group"
      >
        <span className="font-bold text-gray-800 group-hover:text-primary transition-colors">{title}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function HelpPage() {
  const [openItem, setOpenItem] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFaqs, setEditedFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.getSetting('help_faqs');
      if (res.data?.data) {
        let parsedData = res.data.data;
        if (typeof parsedData === 'string') {
          parsedData = JSON.parse(parsedData);
        }
        setFaqs(parsedData);
      } else {
        setFaqs([]);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditedFaqs([...faqs]);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveFaqs = async () => {
    try {
      await settingsAPI.updateSetting('help_faqs', { value: JSON.stringify(editedFaqs) });
      setFaqs(editedFaqs);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Help page FAQs updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update FAQs',
        variant: 'destructive',
      });
    }
  };

  const handleAddFaq = () => {
    setEditedFaqs([...editedFaqs, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    const newFaqs = [...editedFaqs];
    newFaqs.splice(index, 1);
    setEditedFaqs(newFaqs);
  };

  const handleFaqChange = (index: number, field: keyof FAQ, value: string) => {
    const newFaqs = [...editedFaqs];
    newFaqs[index][field] = value;
    setEditedFaqs(newFaqs);
  };

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <NavHeader 
        title="Help & User Manual" 
        subtitle="Learn how to use the Property Inventory Management System"
        showBackButton={true}
      >
        <NotificationProfile 
          notifications={[]}
          unreadCount={0}
          currentUser={currentUser}
          onMarkAsRead={() => {}}
          onMarkAllAsRead={() => {}}
        />
      </NavHeader>

      <div className="container mx-auto p-4 sm:p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System User Manual</h1>
              <p className="text-gray-500 text-sm">Comprehensive guide for Caloc-an Elementary School OIMS</p>
            </div>
          </div>
          {isAdmin && !isEditing && (
            <Button onClick={handleEditClick} className="flex items-center gap-2">
              <Edit className="w-4 h-4" /> Edit Content
            </Button>
          )}
        </div>

        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center mb-3">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg font-black">Inventory Basics</CardTitle>
                <CardDescription>Learn how equipment is tracked and categorized.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded bg-green-50 flex items-center justify-center mb-3">
                  <UserCheck className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle className="text-lg font-black">Borrowing Workflow</CardTitle>
                <CardDescription>Step-by-step guide on requesting and returning items.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded bg-purple-50 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle className="text-lg font-black">Accountability</CardTitle>
                <CardDescription>Understanding penalties, condition logs, and disposal.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        <Card className="border-none shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b p-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            {isEditing && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveFaqs}>
                  <Save className="w-4 h-4 mr-1" /> Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading && !isEditing ? (
              <div className="p-8 text-center text-gray-500">Loading FAQs...</div>
            ) : isEditing ? (
              <div className="p-6 space-y-6 bg-gray-50">
                {editedFaqs.map((faq, index) => (
                  <Card key={index} className="shadow-sm">
                    <CardHeader className="p-4 bg-white border-b flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold text-gray-700">FAQ Item #{index + 1}</CardTitle>
                      <button onClick={() => handleRemoveFaq(index)} className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Question</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="e.g. How do I borrow items?"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Answer</label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 h-24 resize-y"
                          placeholder="Provide the detailed answer here..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="secondary" className="w-full py-8 border-dashed flex items-center justify-center gap-2 text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/5" onClick={handleAddFaq}>
                  <Plus className="w-5 h-5" /> Add New FAQ
                </Button>
              </div>
            ) : (
              <div className="w-full divide-y divide-gray-100">
                {faqs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No FAQs available.</div>
                ) : (
                  faqs.map((faq, index) => (
                    <CustomAccordionItem 
                      key={index}
                      title={faq.question} 
                      isOpen={openItem === index}
                      onToggle={() => toggleItem(index)}
                    >
                      {faq.answer}
                    </CustomAccordionItem>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {!isEditing && (
          <>
            <div className="mt-12 bg-primary/5 rounded-2xl p-8 border border-primary/10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Need further assistance?</h3>
                <p className="text-gray-600 text-sm">If you encounter any technical issues or have questions not covered here, please contact the IT support or the School Property Custodian.</p>
              </div>
              <button className="md:ml-auto px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95">
                Contact Support
              </button>
            </div>

            <div className="mt-12 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Info className="w-3 h-3" />
              <span>Caloc-an Elementary School OIMS v2.1.0 (Capstone Defense Build)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
