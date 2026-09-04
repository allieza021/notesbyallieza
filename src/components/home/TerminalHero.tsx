'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeUp } from '@/components/shared/FadeUp';

export function TerminalHero() {
  const [text, setText] = useState('');
  const fullText = "Allieza Segales, 3rd Year BSIT Student.";
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-2xl bg-white dark:bg-[#0d1117] transform transition-transform hover:scale-[1.02] duration-500 w-full max-w-lg mx-auto md:ml-auto">
      {/* Mac Header */}
      <div className="bg-gray-100 dark:bg-[#161b22] px-4 py-3 flex items-center gap-2 border-b border-border/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="mx-auto flex items-center gap-2 text-xs text-gray-500 dark:text-muted-foreground font-mono">
          <Terminal className="w-3.5 h-3.5" /> guest@allieza:~
        </div>
      </div>
      
      {/* Terminal Body */}
      <div className="p-5 md:p-6 font-mono text-sm md:text-base h-[200px] md:h-[240px] flex flex-col gap-3 text-gray-800 dark:text-gray-200">
        <div className="flex items-center text-gray-500 dark:text-muted-foreground">
          <span className="text-primary mr-2">guest@allieza:~$</span> whoami
        </div>
        <div className="flex text-green-700 dark:text-[#3fb950]">
          <span className="mr-2">{'>'}</span>
          <span>
            {text}
            {isTyping && <span className="inline-block w-2 h-4 bg-green-700 dark:bg-[#3fb950] ml-1 animate-pulse" />}
          </span>
        </div>
        {!isTyping && (
          <FadeUp delay={0.1}>
            <div className="flex items-center text-gray-500 dark:text-muted-foreground mt-2">
              <span className="text-primary mr-2">guest@allieza:~$</span> cat skills.txt
            </div>
            <div className="flex flex-wrap gap-2 text-blue-600 dark:text-[#58a6ff] mt-2">
              <span>[+] Information Security</span>
              <span>[+] Software Development</span>
              <span>[+] Blog Writing...?</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-muted-foreground mt-4">
              <span className="text-primary mr-2">guest@allieza:~$</span> <span className="inline-block w-2 h-4 bg-gray-400 dark:bg-muted-foreground ml-1 animate-pulse" />
            </div>
          </FadeUp>
        )}
      </div>
    </div>
  );
}
