import React from 'react';
import { HelpCircle, Mail, MessageCircle, FileText, ChevronRight } from 'lucide-react';

const HelpPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-slate-500 mt-2">Find answers or reach out to our team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <ContactCard icon={<Mail />} title="Email Support" desc="Get help via email within 24 hours." color="text-emerald-500" bg="bg-emerald-100" />
        <ContactCard icon={<MessageCircle />} title="Live Chat" desc="Available 9 AM to 5 PM EST." color="text-blue-500" bg="bg-blue-100" />
        <ContactCard icon={<FileText />} title="Documentation" desc="Read our detailed guides." color="text-purple-500" bg="bg-purple-100" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="text-emerald-500" /> Frequently Asked Questions
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          <FAQItem 
            question="How do I settle a balance?"
            answer="Navigate to the Balances tab, click on any non-zero balance card, and click the 'Settle Up' button. You can record a full or partial cash payment."
          />
          <FAQItem 
            question="Can I split unequally?"
            answer="Yes! When adding an expense, choose the 'Unequal', 'Percentage', or 'Shares' tab in Step 2 to distribute the cost exactly as you want."
          />
          <FAQItem 
            question="How is 'Total Net' calculated?"
            answer="Your Total Net is the sum of everything owed to you across all groups minus everything you owe. Positive means people owe you overall; negative means you are in debt."
          />
          <FAQItem 
            question="Is there a mobile app?"
            answer="Currently, SplitwiseClone is a responsive web application that works great on your mobile browser. A native app is coming soon!"
          />
        </div>
      </div>
    </div>
  );
};

const ContactCard = ({ icon, title, desc, color, bg }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer group">
    <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const FAQItem = ({ question, answer }) => (
  <details className="group p-6 cursor-pointer">
    <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-slate-800 hover:text-emerald-600 transition-colors">
      <span>{question}</span>
      <span className="transition group-open:rotate-90">
        <ChevronRight size={20} className="text-slate-400" />
      </span>
    </summary>
    <div className="text-slate-500 mt-4 text-sm leading-relaxed pr-8 animate-in slide-in-from-top-1 opacity-0 fade-in duration-200 fill-mode-forwards">
      {answer}
    </div>
  </details>
);

export default HelpPage;
