import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, HelpCircle, Package, UserCheck, ShieldCheck, Mail, Info, ChevronDown } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';

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
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 text-gray-600 leading-relaxed text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function HelpPage() {
  const [openItem, setOpenItem] = useState<string | null>("item-1");
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const toggleItem = (value: string) => {
    setOpenItem(openItem === value ? null : value);
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
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System User Manual</h1>
            <p className="text-gray-500 text-sm">Comprehensive guide for Caloc-an Elementary School OIMS</p>
          </div>
        </div>

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

        <Card className="border-none shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b p-6">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full divide-y divide-gray-100">
              
              <CustomAccordionItem 
                title="How do I request to borrow equipment?" 
                isOpen={openItem === "item-1"}
                onToggle={() => toggleItem("item-1")}
              >
                Go to the <strong>Browse Inventory</strong> page, find the category of equipment you need, and click <strong>Request Borrow</strong>. 
                Specify the quantity and the system will automatically suggest a return date. Your request will be sent to the Property Custodian for approval.
              </CustomAccordionItem>

              <CustomAccordionItem 
                title="What happens if I return an item damaged?" 
                isOpen={openItem === "item-2"}
                onToggle={() => toggleItem("item-2")}
              >
                Upon return, the Property Custodian will inspect the item. If it is marked as <strong>Damaged</strong> or <strong>Lost</strong>, 
                a penalty amount may be assessed based on the school's policy. This will be recorded in your transaction history and the item's condition log.
              </CustomAccordionItem>

              <CustomAccordionItem 
                title="What is 'Pending Acceptance'?" 
                isOpen={openItem === "item-3"}
                onToggle={() => toggleItem("item-3")}
              >
                When equipment is distributed to you (long-term assignment), it appears in your <strong>My Inventory</strong> under "Pending Acceptance". 
                You must digitally acknowledge receipt to complete the accountability transfer.
              </CustomAccordionItem>

              <CustomAccordionItem 
                title="Why can't I borrow a specific category?" 
                isOpen={openItem === "item-4"}
                onToggle={() => toggleItem("item-4")}
              >
                If a category card is grayed out and shows <strong>"All Units Out"</strong>, it means all items in that category are currently borrowed or distributed. 
                You will need to wait for a unit to be returned or coordinate with the admin.
              </CustomAccordionItem>

              {currentUser?.role === 'admin' && (
                <CustomAccordionItem 
                  title="How do I manage the Disposal Queue?" 
                  isOpen={openItem === "item-5"}
                  onToggle={() => toggleItem("item-5")}
                >
                  Items that are broken or past their expected lifespan should be marked as <strong>Ready for Disposal</strong>. 
                  You can find these in the Disposal Queue card on your dashboard. Marking an item for disposal prevents it from being borrowed while keeping its history in the system.
                </CustomAccordionItem>
              )}

            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
