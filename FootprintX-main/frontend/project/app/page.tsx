import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, BarChart3, Globe2, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section */}
      <section className="relative">
        <div className="container flex min-h-[40rem] flex-col items-center justify-center py-24 text-center">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]" />
          <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
            Track Your Carbon Footprint with{' '}
            <span className="text-green-600">FootprintX</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Join the movement towards a sustainable future. Monitor, reduce, and offset your carbon
            footprint with our AI-powered platform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/calculate">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Register Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="p-6">
            <Globe2 className="h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-xl font-bold">Track Your Impact</h3>
            <p className="mt-2 text-muted-foreground">
              Monitor your physical and digital carbon footprint with our comprehensive tracking system.
            </p>
          </Card>
          <Card className="p-6">
            <Lightbulb className="h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-xl font-bold">AI-Powered Insights</h3>
            <p className="mt-2 text-muted-foreground">
              Get personalized recommendations and insights to reduce your environmental impact.
            </p>
          </Card>
          <Card className="p-6">
            <BarChart3 className="h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-xl font-bold">Real-time Analytics</h3>
            <p className="mt-2 text-muted-foreground">
              Visualize your progress and compare your impact with interactive charts and graphs.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}