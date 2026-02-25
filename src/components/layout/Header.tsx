'use client';

/**
 * Header Component
 * Top navigation bar with search and theme toggle
 */

import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StockSearch } from '@/components/dashboard/StockSearch';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function Header({ title = 'Dashboard', showSearch = true }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-full px-6">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Stock Search (smaller version for non-dashboard pages) */}
          {showSearch && title !== 'Dashboard' && (
            <div className="hidden md:block">
              <StockSearch 
                navigationMode={true}
                className="w-64" 
                placeholder="Search securities..."
              />
            </div>
          )}

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
