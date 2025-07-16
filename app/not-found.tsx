/**
 * @fileoverview Custom 404 Not Found page
 * @author aggroNATION Development Team
 * @version 1.0.0
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader className="pb-8">
          <div className="mx-auto mb-6 w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">404</span>
          </div>
          <CardTitle className="text-3xl font-bold">Page Not Found</CardTitle>
          <CardDescription className="text-lg mt-2">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-muted-foreground">
            <p>Don't worry, let's get you back on track!</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="flex items-center gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="flex items-center gap-2">
              <Link href="javascript:history.back()">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3">Popular Pages:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/models">AI Models</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/repos">Repositories</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/papers">Research Papers</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/news">News</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
