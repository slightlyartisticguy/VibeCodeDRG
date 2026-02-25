'use client';

/**
 * Help Page
 * User documentation and support
 */

import { Header } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Star,
  Clock,
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'How do I add stocks to my portfolio?',
    answer: 'Click the "Add Stock" button in the header, search for the stock symbol, enter the number of shares and your average cost, then click Add to Portfolio.',
  },
  {
    question: 'How often is the stock data updated?',
    answer: 'Stock quotes are refreshed every 5 minutes during market hours. Historical data is updated once per day after market close.',
  },
  {
    question: 'Can I track stocks from international markets?',
    answer: 'Yes! Our data provider Alpha Vantage supports stocks from major international exchanges including NYSE, NASDAQ, LSE, TSE, and more.',
  },
  {
    question: 'How do I set up price alerts?',
    answer: 'Go to Settings > Notifications and enable Price Alerts. Then, on any stock detail page, click the bell icon to set your target price.',
  },
  {
    question: 'Is my portfolio data secure?',
    answer: 'Yes, all your data is encrypted and stored securely. We never share your portfolio information with third parties.',
  },
];

const QUICK_LINKS = [
  { icon: TrendingUp, title: 'Getting Started', description: 'Learn the basics of using StockFolio' },
  { icon: Briefcase, title: 'Managing Portfolio', description: 'Add, edit, and track your holdings' },
  { icon: Star, title: 'Watchlist Guide', description: 'Track stocks you\'re interested in' },
  { icon: Clock, title: 'Transaction History', description: 'View and export your trade history' },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Help & Support" />
      
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Search Help */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">How can we help you?</CardTitle>
            <CardDescription>
              Search our knowledge base or browse common topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help..."
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUICK_LINKS.map((link, index) => {
            const Icon = link.icon;
            return (
              <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="border-b border-border last:border-0 pb-4 last:pb-0">
                <h4 className="font-medium mb-2">{item.question}</h4>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>
              Our support team is here to assist you
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1 gap-2">
              <MessageCircle className="h-4 w-4" />
              Live Chat
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <ExternalLink className="h-4 w-4" />
              Documentation
            </Button>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Developer Resources</CardTitle>
            <CardDescription>
              Learn about the Alpha Vantage API powering our data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              StockFolio uses the Alpha Vantage API for real-time and historical stock data.
              The free tier provides 5 API calls per minute and 500 calls per day.
            </p>
            <Button variant="outline" className="gap-2" asChild>
              <a
                href="https://www.alphavantage.co/documentation/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                View API Documentation
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
