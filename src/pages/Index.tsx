import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Shield, Zap, Target, Globe } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <TrendingUp className="h-16 w-16 text-primary mr-4" />
              <BarChart3 className="h-14 w-14 text-secondary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              DynamicPrice Pro
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              AI-Powered Dynamic Pricing Recommendation System for E-commerce Platforms
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Leverage price elasticity of demand analysis to optimize your product pricing strategy 
              and maximize revenue through intelligent recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for intelligent pricing optimization
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>
                  Enterprise-grade security with password hashing and session management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Secure user registration & login</li>
                  <li>• Password encryption (bcrypt)</li>
                  <li>• Role-based access control</li>
                  <li>• Session handling with JWT</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Price Elasticity Analysis</CardTitle>
                <CardDescription>
                  Advanced ML algorithms to analyze demand sensitivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Log-log regression analysis</li>
                  <li>• Elastic vs inelastic classification</li>
                  <li>• Statistical significance testing</li>
                  <li>• Historical trend analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Smart Recommendations</CardTitle>
                <CardDescription>
                  AI-driven pricing suggestions for revenue optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Revenue maximization strategies</li>
                  <li>• Profit optimization options</li>
                  <li>• Expected impact predictions</li>
                  <li>• A/B testing recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Real-time Analytics</CardTitle>
                <CardDescription>
                  Interactive dashboards with live data visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Interactive charts & graphs</li>
                  <li>• Real-time price monitoring</li>
                  <li>• Performance metrics tracking</li>
                  <li>• Custom date range analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Multi-Category Support</CardTitle>
                <CardDescription>
                  Handle diverse product portfolios across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Electronics, books, clothing, food</li>
                  <li>• Category-specific optimization</li>
                  <li>• Cross-category insights</li>
                  <li>• Bulk data import/export</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Export & Integration</CardTitle>
                <CardDescription>
                  Seamless integration with your existing systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• CSV export functionality</li>
                  <li>• API integration ready</li>
                  <li>• Automated report generation</li>
                  <li>• Data backup & restore</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Optimize Your Pricing Strategy?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join businesses using AI-driven insights to increase revenue and maximize profitability.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-6"
          >
            Start Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
