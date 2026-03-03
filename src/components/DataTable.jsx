import React, { useState, useMemo } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Database
} from 'lucide-react';

/**
 * Modern DataTable Component
 * 
 * Props:
 * - columns: Array of { key, label, sortable?, render?, width?, align? }
 * - data: Array of row objects
 * - loading: boolean
 * - onRowClick: (row) => void
 * - selectable: boolean
 * - selectedRows: Array of selected IDs
 * - onSelect: (id) => void
 * - rowKey: string (default: 'id')
 * - searchable: boolean
 * - searchPlaceholder: string
 * - pageSize: number (default: 10)
 * - emptyMessage: string
 * - rowClassName: (row) => string
 * - stickyActions: boolean
 */
export default function DataTable({
    columns = [],
    data = [],
    loading = false,
    onRowClick,
    selectable = false,
    selectedRows = [],
    onSelect,
    rowKey = 'id',
    searchable = true,
    searchPlaceholder = 'Tabloda ara...',
    pageSize = 10,
    emptyMessage = 'Gösterilecek veri bulunamadı.',
    rowClassName,
    stickyActions = false,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);

    // Deep search helper: extract all string values from an object (recursively)
    const extractSearchableValues = (obj, depth = 0) => {
        if (depth > 3 || obj === null || obj === undefined) return [];
        if (typeof obj === 'string') return [obj];
        if (typeof obj === 'number' || typeof obj === 'boolean') return [String(obj)];
        if (Array.isArray(obj)) return obj.flatMap(item => extractSearchableValues(item, depth + 1));
        if (typeof obj === 'object') {
            return Object.values(obj).flatMap(val => extractSearchableValues(val, depth + 1));
        }
        return [];
    };

    // Search filtering - searches ALL values in each row
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;
        const query = searchQuery.toLowerCase().trim();
        const queryTerms = query.split(/\s+/); // Support multi-word search

        return data.filter(row => {
            // 1. Collect all searchable text from row
            const allValues = [];

            // From column keys and their searchKeys
            columns.forEach(col => {
                if (col.key === 'actions') return; // Skip actions column
                const value = row[col.key];
                if (value !== null && value !== undefined) {
                    allValues.push(String(value).toLowerCase());
                }
                // Support searchKeys: column can define additional keys to search
                if (col.searchKeys) {
                    col.searchKeys.forEach(sk => {
                        const parts = sk.split('.');
                        let val = row;
                        for (const part of parts) {
                            val = val?.[part];
                        }
                        if (val !== null && val !== undefined) {
                            allValues.push(String(val).toLowerCase());
                        }
                    });
                }
            });

            // 2. Also search all top-level primitive values in the row
            Object.entries(row).forEach(([key, val]) => {
                if (key === 'id' || key === 'actions') return;
                if (typeof val === 'string' || typeof val === 'number') {
                    const strVal = String(val).toLowerCase();
                    if (!allValues.includes(strVal)) {
                        allValues.push(strVal);
                    }
                }
                // Nested object (one level deep)
                if (val && typeof val === 'object' && !Array.isArray(val)) {
                    Object.values(val).forEach(nestedVal => {
                        if (typeof nestedVal === 'string' || typeof nestedVal === 'number') {
                            allValues.push(String(nestedVal).toLowerCase());
                        }
                    });
                }
            });

            const searchText = allValues.join(' ');
            // ALL query terms must match (AND logic for multi-word search)
            return queryTerms.every(term => searchText.includes(term));
        });
    }, [data, searchQuery, columns]);

    // Sorting
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const comparison = String(aVal).localeCompare(String(bVal), 'tr');
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortConfig]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const validCurrentPage = Math.min(currentPage, totalPages);
    const paginatedData = sortedData.slice(
        (validCurrentPage - 1) * pageSize,
        validCurrentPage * pageSize
    );

    // Reset page when data changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, data.length]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={13} className="text-slate-300" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={13} className="text-[#D36A47]" />
            : <ArrowDown size={13} className="text-[#D36A47]" />;
    };

    // Page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, validCurrentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Skeleton rows for loading
    const renderSkeleton = () => (
        <>
            {[...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                    {selectable && (
                        <td className="py-4 px-4">
                            <div className="w-4 h-4 bg-slate-100 rounded animate-shimmer"></div>
                        </td>
                    )}
                    {columns.map((col, j) => (
                        <td key={j} className="py-4 px-4">
                            <div
                                className="h-4 bg-slate-100 rounded-lg animate-shimmer"
                                style={{ width: `${Math.random() * 40 + 40}%`, animationDelay: `${j * 0.1}s` }}
                            ></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );

    return (
        <div className="animate-fade-in">
            {/* Search Bar */}
            {searchable && (
                <div className="mb-4">
                    <div className="relative max-w-md">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#D36A47]/10 focus:border-[#D36A47]/30 transition-all shadow-sm"
                        />
                        {searchQuery && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                                    {filteredData.length} sonuç
                                </span>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-700 transition-colors text-xs font-bold"
                                    title="Aramayı temizle"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="data-table-container">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {selectable && (
                                    <th style={{ width: 44 }} className="!px-3">
                                        <input
                                            type="checkbox"
                                            checked={paginatedData.length > 0 && paginatedData.every(r => selectedRows.includes(r[rowKey]))}
                                            onChange={() => {
                                                const pageIds = paginatedData.map(r => r[rowKey]);
                                                const allSelected = pageIds.every(id => selectedRows.includes(id));
                                                if (allSelected) {
                                                    // Deselect page items
                                                    pageIds.forEach(id => onSelect && onSelect(id));
                                                } else {
                                                    // Select page items
                                                    pageIds.forEach(id => {
                                                        if (!selectedRows.includes(id)) onSelect && onSelect(id);
                                                    });
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-slate-300 text-[#D36A47] focus:ring-[#D36A47] cursor-pointer accent-[#D36A47]"
                                        />
                                    </th>
                                )}
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={`${col.sortable !== false ? 'sortable' : ''}`}
                                        style={{ width: col.width, textAlign: col.align || 'left' }}
                                        onClick={() => col.sortable !== false && handleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1.5" style={{ justifyContent: col.align === 'center' ? 'center' : 'flex-start' }}>
                                            {col.label}
                                            {col.sortable !== false && getSortIcon(col.key)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                renderSkeleton()
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (selectable ? 1 : 0)}>
                                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                                <Database size={28} className="text-slate-300" />
                                            </div>
                                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{emptyMessage}</p>
                                            {searchQuery && (
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Farklı bir arama terimi deneyebilirsiniz.
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, idx) => (
                                    <tr
                                        key={row[rowKey] || idx}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        className={`
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${selectedRows.includes(row[rowKey]) ? 'selected' : ''}
                      ${rowClassName ? rowClassName(row) : ''}
                    `}
                                        style={{ animationDelay: `${idx * 0.03}s` }}
                                    >
                                        {selectable && (
                                            <td className="!px-3" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(row[rowKey])}
                                                    onChange={() => onSelect && onSelect(row[rowKey])}
                                                    className="w-4 h-4 rounded border-slate-300 text-[#D36A47] focus:ring-[#D36A47] cursor-pointer accent-[#D36A47]"
                                                />
                                            </td>
                                        )}
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                style={{ textAlign: col.align || 'left' }}
                                                onClick={col.stopPropagation ? (e) => e.stopPropagation() : undefined}
                                            >
                                                {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!loading && sortedData.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                        <div className="text-xs text-slate-500 font-medium">
                            Toplam <span className="text-slate-700 font-semibold">{sortedData.length}</span> kayıttan{' '}
                            <span className="text-slate-700 font-semibold">
                                {(validCurrentPage - 1) * pageSize + 1}–{Math.min(validCurrentPage * pageSize, sortedData.length)}
                            </span>{' '}
                            arası gösteriliyor
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(1)}
                                disabled={validCurrentPage === 1}
                            >
                                <ChevronsLeft size={15} />
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={validCurrentPage === 1}
                            >
                                <ChevronLeft size={15} />
                            </button>

                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    className={`pagination-btn ${validCurrentPage === page ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={validCurrentPage === totalPages}
                            >
                                <ChevronRight size={15} />
                            </button>
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={validCurrentPage === totalPages}
                            >
                                <ChevronsRight size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
