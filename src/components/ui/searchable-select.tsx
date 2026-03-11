'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'

type Option = {
  value: string;
  label: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  label = ""
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.value === value)
  const filteredOptions = options.filter(o => {
    const s = search.toLowerCase()
    return o.label.toLowerCase().includes(s) || o.value.toLowerCase().includes(s)
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen) setSearch('') // Reset search on open
          }}
          className="w-full flex items-center justify-between border border-slate-300 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc8822] focus:border-[#cc8822] bg-white transition-colors hover:border-slate-400"
        >
          <span className="truncate text-slate-700">
            {selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}
          </span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                className="w-full text-sm outline-none bg-transparent py-1 text-slate-700"
                placeholder="Pesquisar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <ul className="max-h-60 overflow-y-auto w-full py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      value === option.value ? 'bg-amber-50 text-[#cc8822] font-medium' : 'text-slate-700'
                    }`}
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                      setSearch('')
                    }}
                  >
                    <span className="truncate pr-4">{option.label}</span>
                    {value === option.value && <Check size={16} className="text-[#cc8822] flex-shrink-0" />}
                  </li>
                ))
              ) : (
                <li className="px-3 py-6 text-sm text-center text-slate-500">
                  Nenhum resultado encontrado.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
