"use client";
import { useState } from 'react';

export default function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-outline-variant">
      <button 
        className="w-full text-left py-6 flex justify-between items-center focus:outline-none" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-headline-sm text-headline-sm text-primary">{question}</span>
        <span 
          className="material-symbols-outlined text-primary transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          {isOpen ? 'remove' : 'add'}
        </span>
      </button>
      <div 
        className={`pb-6 font-body-md text-body-md text-on-surface-variant pr-12 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pb-0'}`}
      >
        {answer}
      </div>
    </div>
  );
}
