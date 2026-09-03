import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';

const SearchableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = '-- Select Shop --',
  searchPlaceholder = 'Search shop name...',
  name,
  required = false,
  disabled = false,
  className = '',
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options to { value, label, subLabel } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      if (Array.isArray(opt)) {
        return {
          value: opt[0] ?? '',
          label: opt[0] ?? '',
          subLabel: opt[1] ? `₹${opt[1]}` : ''
        };
      }
      return {
        value: opt.value ?? opt.name ?? '',
        label: opt.label ?? opt.name ?? opt.value ?? '',
        subLabel: opt.subLabel ?? ''
      };
    }
    return {
      value: String(opt),
      label: String(opt),
      subLabel: ''
    };
  });

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find currently selected option object
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autofocus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setHighlightedIndex(0);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { name, value: val } });
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({ target: { name, value: '' } });
    }
  };

  // Ensure highlighted item is in view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative', width: '100%', ...style }}
      className={className}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input to satisfy form validation & submission */}
      <input
        type="text"
        name={name}
        value={value}
        required={required}
        tabIndex={-1}
        onChange={() => {}}
        style={{
          opacity: 0,
          position: 'absolute',
          height: 0,
          width: 0,
          bottom: 0,
          left: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Main trigger button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '10px 14px',
          background: 'var(--bg-tertiary)',
          border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
          boxShadow: isOpen ? '0 0 0 2px rgba(59, 130, 246, 0.25)' : 'none',
          borderRadius: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: '0.95rem',
          fontWeight: selectedOption ? '500' : '400',
          transition: 'all var(--transition-fast)',
          userSelect: 'none',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {value && !disabled && (
            <span
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)'
              }}
              title="Clear selection"
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown 
            size={16} 
            color="var(--text-secondary)" 
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform var(--transition-fast)'
            }} 
          />
        </div>
      </div>

      {/* Dropdown Menu with Search Box */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {/* Search Box Header */}
          <div style={{
            padding: '8px 10px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.4)'
          }}>
            <Search size={16} color="var(--text-secondary)" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(0);
              }}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                padding: '4px 0'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results count hint */}
          <div style={{
            padding: '4px 12px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
          }}>
            <span>{filteredOptions.length} available</span>
            {searchTerm && <span>Filtered</span>}
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem'
              }}>
                No shops matching "{searchTerm}"
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={opt.value + index}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isHighlighted 
                        ? 'rgba(59, 130, 246, 0.2)' 
                        : isSelected 
                          ? 'rgba(59, 130, 246, 0.1)' 
                          : 'transparent',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? '600' : '400',
                      transition: 'background var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span>{opt.label}</span>
                      {opt.subLabel && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {opt.subLabel}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check size={16} color="var(--accent-primary)" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
