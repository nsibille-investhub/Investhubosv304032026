import { motion } from 'motion/react';
import { Building2, Users, TrendingUp, MapPin, Calendar, DollarSign, Percent, Mail, Phone, ExternalLink, FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { EntityLink } from './EntityLinks';

interface LinkDetailCardProps {
  link: EntityLink;
}

export function LinkDetailCard({ link }: LinkDetailCardProps) {
  const getIcon = () => {
    switch (link.type) {
      case 'investor':
        return <TrendingUp className="w-5 h-5" />;
      case 'distributor':
        return <Users className="w-5 h-5" />;
      case 'participation':
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    switch (link.type) {
      case 'investor':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'distributor':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          gradient: 'from-purple-500 to-purple-600'
        };
      case 'participation':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          gradient: 'from-emerald-500 to-emerald-600'
        };
    }
  };

  const color = getColor();

  // Mock data based on type
  const getMockDetails = () => {
    switch (link.type) {
      case 'investor':
        return {
          fullName: link.name,
          email: 'investor@example.com',
          phone: '+1 234 567 8900',
          address: '123 Wall Street, New York, NY 10005',
          investmentAmount: link.amount || '$2,500,000',
          investmentDate: link.date || '2024-03-15',
          status: link.status || 'Active',
          fundName: 'InvestHub Growth Fund II',
          commitmentDate: '2024-01-10'
        };
      case 'distributor':
        return {
          fullName: link.name,
          email: 'contact@distributor.com',
          phone: '+1 234 567 8901',
          address: '456 Market Street, San Francisco, CA 94102',
          region: 'North America',
          since: link.date || '2023-06-01',
          status: link.status || 'Active',
          totalSales: link.amount || '$5,200,000',
          commission: link.percentage || '8%'
        };
      case 'participation':
        return {
          fullName: link.name,
          email: 'ir@company.com',
          phone: '+1 234 567 8902',
          address: '789 Tech Avenue, Austin, TX 78701',
          ownership: link.percentage || '15.5%',
          acquisitionDate: link.date || '2023-11-20',
          status: link.status || 'Active',
          valuation: link.amount || '$12,000,000',
          sector: 'Technology'
        };
    }
  };

  const details = getMockDetails();

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className={`p-4 ${color.bg} border-b ${color.border}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 bg-gradient-to-br ${color.gradient} rounded-lg text-white shadow-sm`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{link.reference}</h3>
              <Badge className={`${color.bg} ${color.text} ${color.border} border text-xs capitalize`}>
                {link.type}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{details.fullName}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {link.type === 'investor' && (
          <>
            <DetailRow icon={DollarSign} label="Investment Amount" value={details.investmentAmount} />
            <DetailRow icon={Calendar} label="Investment Date" value={details.investmentDate} />
            <DetailRow icon={FileText} label="Fund" value={details.fundName} />
            <Separator />
            <DetailRow icon={Mail} label="Email" value={details.email} />
            <DetailRow icon={Phone} label="Phone" value={details.phone} />
            <DetailRow icon={MapPin} label="Address" value={details.address} />
          </>
        )}

        {link.type === 'distributor' && (
          <>
            <DetailRow icon={MapPin} label="Region" value={details.region} />
            <DetailRow icon={DollarSign} label="Total Sales" value={details.totalSales} />
            <DetailRow icon={Percent} label="Commission" value={details.commission} />
            <DetailRow icon={Calendar} label="Partner Since" value={details.since} />
            <Separator />
            <DetailRow icon={Mail} label="Email" value={details.email} />
            <DetailRow icon={Phone} label="Phone" value={details.phone} />
            <DetailRow icon={MapPin} label="Address" value={details.address} />
          </>
        )}

        {link.type === 'participation' && (
          <>
            <DetailRow icon={Percent} label="Ownership" value={details.ownership} />
            <DetailRow icon={DollarSign} label="Valuation" value={details.valuation} />
            <DetailRow icon={Building2} label="Sector" value={details.sector} />
            <DetailRow icon={Calendar} label="Acquisition Date" value={details.acquisitionDate} />
            <Separator />
            <DetailRow icon={Mail} label="Email" value={details.email} />
            <DetailRow icon={Phone} label="Phone" value={details.phone} />
            <DetailRow icon={MapPin} label="Address" value={details.address} />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            View Full Profile
          </Button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <ExternalLink className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-gray-900 font-medium break-words">{value}</div>
      </div>
    </div>
  );
}
