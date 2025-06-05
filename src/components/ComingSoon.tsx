
import React from "react";
import { Clock, Wrench } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  description = "This feature is under development and will be available soon." 
}) => {
  return (
    <div className="max-w-4xl mx-auto py-16">
      <div className="enterprise-card p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-slate-600/50 backdrop-blur-sm">
              <Clock className="w-12 h-12 text-blue-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-amber-500/30">
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-slate-100 mb-4 tracking-tight">
          {title}
        </h1>
        
        <div className="inline-flex items-center px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
          <span className="text-amber-400 font-semibold text-lg tracking-wide">Coming Soon</span>
        </div>
        
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">In Development</h3>
            <p className="text-slate-400 text-sm">Our team is actively working on this feature</p>
          </div>
          
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Wrench className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Advanced Features</h3>
            <p className="text-slate-400 text-sm">Packed with powerful capabilities and insights</p>
          </div>
          
          <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-purple-400 font-bold text-xl">✨</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">User-Friendly</h3>
            <p className="text-slate-400 text-sm">Designed with intuitive interface and workflows</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
