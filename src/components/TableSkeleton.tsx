import { motion } from 'motion/react';

export function TableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            <th className="px-6 py-4 text-left">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            </th>
            {['Name', 'Type', 'Links', 'Status', 'Exposure', 'Risk Level', 'Monitoring', '# Hits', '# Decisions', 'Analyst'].map((header, idx) => (
              <th key={idx} className="px-6 py-4 text-left">
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
              </th>
            ))}
            <th className="px-6 py-4" />
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((row, rowIdx) => (
            <motion.tr
              key={row}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rowIdx * 0.1 }}
              className="border-b border-gray-100"
            >
              <td className="px-6 py-4">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-20 h-6 bg-gray-200 rounded-lg animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-16 h-6 bg-gray-200 rounded-lg animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-20 h-6 bg-gray-200 rounded-lg animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-12 h-6 bg-gray-200 rounded-lg animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-8 h-6 bg-gray-200 rounded-lg animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-8 h-6 bg-gray-200 rounded-lg animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
