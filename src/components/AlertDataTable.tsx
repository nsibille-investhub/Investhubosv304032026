import { motion } from 'motion/react';
import { Eye, CheckCircle2, XCircle, Clock, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertItem } from '../utils/alertsGenerator';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface AlertDataTableProps {
  data: AlertItem[];
  hoveredRow: string | null;
  setHoveredRow: (id: string | null) => void;
  onRowClick: (row: AlertItem) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  onDecision?: (alertId: string, decision: 'true_hit' | 'false_hit') => void;
}

export function AlertDataTable({ 
  data, 
  hoveredRow, 
  setHoveredRow, 
  onRowClick, 
  sortConfig, 
  onSort,
  onDecision 
}: AlertDataTableProps) {
  
  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pending</Badge>;
      case 'Confirmed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Confirmed</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getChangesBadge = (changes: 'New' | 'Modified' | null) => {
    if (!changes) return null;
    if (changes === 'New') {
      return <Badge className="bg-red-100 text-red-700 border-red-200">New</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Modified</Badge>;
  };

  const getMatchBadge = (match: number) => {
    let colorClass = 'bg-green-100 text-green-700';
    if (match >= 80) {
      colorClass = 'bg-red-100 text-red-700';
    } else if (match >= 60) {
      colorClass = 'bg-orange-100 text-orange-700';
    } else if (match >= 40) {
      colorClass = 'bg-yellow-100 text-yellow-700';
    }
    return <Badge className={colorClass}>{match}%</Badge>;
  };

  const formatDaysAgo = (daysAgo: number) => {
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return '1 day ago';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) {
      const weeks = Math.floor(daysAgo / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    const months = Math.floor(daysAgo / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'text-red-600 bg-red-50';
      case 'Rejected':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-orange-600 bg-orange-50';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-2">
                Name
                {getSortIcon('name')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
              Changes
            </th>
            <th 
              className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('match')}
            >
              <div className="flex items-center gap-2">
                Match
                {getSortIcon('match')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('status')}
            >
              <div className="flex items-center gap-2">
                Status
                {getSortIcon('status')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSort('daysAgo')}
            >
              <div className="flex items-center gap-2">
                Date
                {getSortIcon('daysAgo')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((alert) => (
            <motion.tr
              key={alert.id}
              className={`transition-colors cursor-pointer ${
                hoveredRow === alert.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setHoveredRow(alert.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => onRowClick(alert)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    {alert.name}
                  </div>
                  <div className="text-xs text-gray-500">{alert.entityName}</div>
                </div>
              </td>
              <td className="px-6 py-4">
                {getChangesBadge(alert.changes)}
              </td>
              <td className="px-6 py-4">
                {getMatchBadge(alert.match)}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${getStatusColor(alert.status)}`}>
                      {getStatusIcon(alert.status)}
                    </div>
                    {getStatusBadge(alert.status)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-sm text-gray-600 cursor-help">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDaysAgo(alert.daysAgo)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div>Date: {alert.date}</div>
                      <div className="text-gray-400 mt-1">Il y a {alert.daysAgo} jour{alert.daysAgo > 1 ? 's' : ''}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick(alert);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View details</TooltipContent>
                  </Tooltip>
                  
                  {alert.status === 'Pending' && onDecision && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDecision(alert.id, 'false_hit');
                            }}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>False Hit</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                            className="text-white hover:opacity-90"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDecision(alert.id, 'true_hit');
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>True Hit</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}