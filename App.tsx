import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Customer, SortConfig, SortDirection } from './types';
import { useDebounce } from './hooks/useDebounce';
import { CustomerTable } from './components/CustomerTable';
import { DoubleTickLogo, SearchIcon, FilterIcon, ChevronDownIcon } from './components/icons';

const TOTAL_CUSTOMERS = 1_000_000;

// Helper to generate a dataset.
const generateCustomers = (): Customer[] => {
  const customers: Customer[] = [];
  const addedByNames = ['Kartikey Mishra', 'John Doe', 'Jane Smith', 'Peter Jones', 'Amit Patel', 'Priya Singh'];
  for (let i = 0; i < TOTAL_CUSTOMERS; i++) {
    customers.push({
      id: i + 1,
      name: `Customer ${i + 1}`,
      phone: `+9176000000${(i % 100).toString().padStart(2, '0')}`,
      email: `customer${i + 1}@example.com`,
      score: Math.floor(Math.random() * 30),
      lastMessageAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      addedBy: addedByNames[i % addedByNames.length],
      avatar: `https://i.pravatar.cc/150?u=mail${i}@pravatar.com`,
    });
  }
  return customers;
};

const FilterDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        <FilterIcon />
        Add Filters
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-30">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div className="px-4 py-2 text-xs text-gray-400 uppercase">Dummy Filters</div>
            <div className="block px-4 py-2 text-sm text-gray-700 opacity-60 cursor-not-allowed" role="menuitem">Score is greater than 10</div>
            <div className="block px-4 py-2 text-sm text-gray-700 opacity-60 cursor-not-allowed" role="menuitem">Last message is before 1 week ago</div>
            <div className="block px-4 py-2 text-sm text-gray-700 opacity-60 cursor-not-allowed" role="menuitem">Added by: Kartikey Mishra</div>
          </div>
        </div>
      )}
    </div>
  );
};


function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  useEffect(() => {
    // Generate records asynchronously to avoid blocking the UI thread.
    // This allows the loading screen to render immediately.
    setTimeout(() => {
        setCustomers(generateCustomers());
        setIsLoading(false);
    }, 50);
  }, []);

  const debouncedSearchTerm = useDebounce(searchTerm, 250);

  const filteredAndSortedCustomers = useMemo(() => {
    // Note: Filtering and especially sorting 1M records in the browser can be slow.
    // For a real-world application, these operations should be handled by a server.
    let filtered = customers;

    if (debouncedSearchTerm) {
      const lowercasedFilter = debouncedSearchTerm.toLowerCase();
      filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(lowercasedFilter) ||
        customer.email.toLowerCase().includes(lowercasedFilter) ||
        customer.phone.includes(lowercasedFilter)
      );
    }
    
    // Create a new array to avoid mutating the original
    const sortable = [...filtered];

    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortable;
  }, [customers, debouncedSearchTerm, sortConfig]);

  const handleSort = useCallback((key: keyof Customer) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 font-sans">
        <DoubleTickLogo />
        <div className="mt-6 text-center">
            <h1 className="text-xl font-semibold text-gray-800">Preparing your customer data</h1>
            <p className="text-gray-600 mt-2">Generating 1,000,000 records. This might take a moment...</p>
        </div>
        <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-2.5 rounded-full w-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <DoubleTickLogo />
        </div>
      </header>
      
      <main className="max-w-screen-2xl mx-auto p-6 flex flex-col" style={{height: 'calc(100vh - 73px)'}}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-gray-900">All Customers</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{filteredAndSortedCustomers.length.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search Customers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
          <FilterDropdown />
        </div>

        <CustomerTable 
            customers={filteredAndSortedCustomers}
            sortConfig={sortConfig}
            onSort={handleSort}
        />
      </main>
    </div>
  );
}

export default App;