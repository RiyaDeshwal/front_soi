import React, { memo, CSSProperties, useRef, useState, useLayoutEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Customer, SortConfig } from '../types';
import { SortIcon } from './icons';

interface CustomerTableProps {
  customers: Customer[];
  sortConfig: SortConfig | null;
  onSort: (key: keyof Customer) => void;
}

const Row = memo(({ index, style, data }: { index: number; style: CSSProperties; data: Customer[] }) => {
  const customer = data[index];
  const isEven = index % 2 === 0;

  return (
    <div style={style} className={`flex items-center text-sm text-gray-700 border-b border-gray-200 ${isEven ? 'bg-white' : 'bg-gray-50/50'} hover:bg-emerald-50`}>
      <div className="w-16 flex-shrink-0 px-4 py-3 flex items-center">
        <input type="checkbox" className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
      </div>
      <div className="w-64 flex-shrink-0 px-4 py-3 flex items-center">
        <img src={customer.avatar} alt="avatar" className="h-8 w-8 rounded-full mr-3" />
        <div>
          <div className="font-medium text-gray-800">{customer.name}</div>
          <div className="text-gray-500">{customer.phone}</div>
        </div>
      </div>
      <div className="w-24 flex-shrink-0 px-4 py-3">{customer.score}</div>
      <div className="w-64 flex-shrink-0 px-4 py-3 truncate">{customer.email}</div>
      <div className="w-48 flex-shrink-0 px-4 py-3">{customer.lastMessageAt.toLocaleString()}</div>
      <div className="flex-grow px-4 py-3 flex items-center">
        <img src={`https://i.pravatar.cc/150?u=${customer.addedBy}`} alt="added by avatar" className="h-6 w-6 rounded-full mr-2" />
        <span>{customer.addedBy}</span>
      </div>
    </div>
  );
});

Row.displayName = 'Row';

const TableHeader = ({ onSort, sortConfig }: { onSort: (key: keyof Customer) => void, sortConfig: SortConfig | null }) => {
    const columns: { key: keyof Customer; label: string; width: string, flex?: string }[] = [
        { key: 'name', label: 'Customer', width: 'w-64' },
        { key: 'score', label: 'Score', width: 'w-24' },
        { key: 'email', label: 'Email', width: 'w-64' },
        { key: 'lastMessageAt', label: 'Last message sent at', width: 'w-48' },
        { key: 'addedBy', label: 'Added by', width: 'w-auto', flex: 'flex-grow' },
    ];

    return (
        <div className="sticky top-0 bg-gray-100/70 backdrop-blur-sm z-10 flex items-center font-medium text-xs text-gray-500 uppercase tracking-wider border-b border-gray-300">
            <div className="w-16 flex-shrink-0 px-4 py-3 flex items-center">
                <input type="checkbox" className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
            </div>
            {columns.map(col => (
                <div key={col.key} className={`${col.width} ${col.flex || ''} flex-shrink-0 px-4 py-3`}>
                    <div onClick={() => onSort(col.key)} className="flex items-center cursor-pointer group">
                        <span>{col.label}</span>
                        <SortIcon direction={sortConfig?.key === col.key ? sortConfig.direction : 'none'} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const CustomerTable = ({ customers, sortConfig, onSort }: CustomerTableProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setSize({ width, height });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex-grow flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <TableHeader onSort={onSort} sortConfig={sortConfig} />
      <div ref={containerRef} className="flex-grow">
        {size.height > 0 && (
          <List
              height={size.height}
              itemCount={customers.length}
              itemSize={57} // Row height in pixels
              width={size.width}
              itemData={customers}
            >
              {Row}
          </List>
        )}
      </div>
    </div>
  );
};