import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

interface Recommendation {
  id: string;
  product_name: string;
  category: string;
  current_price: number;
  recommended_price: number;
  elasticity_score: number;
  product_type: string;
  expected_revenue_change: number;
  optimization_target: string;
  created_at: string;
}

export const PriceRecommendations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('price_recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecommendations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (recommendations.length === 0) return;

    const headers = [
      'Product Name',
      'Category',
      'Current Price',
      'Recommended Price',
      'Price Change %',
      'Elasticity Score',
      'Product Type',
      'Expected Revenue Change %',
      'Optimization Target',
      'Date Created'
    ];

    const csvData = recommendations.map(rec => [
      rec.product_name,
      rec.category,
      rec.current_price.toFixed(2),
      rec.recommended_price.toFixed(2),
      (((rec.recommended_price - rec.current_price) / rec.current_price) * 100).toFixed(1),
      rec.elasticity_score.toFixed(2),
      rec.product_type,
      rec.expected_revenue_change.toFixed(1),
      rec.optimization_target,
      new Date(rec.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `price_recommendations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Recommendations exported to CSV",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Recommendations Available</CardTitle>
          <CardDescription>
            Perform elasticity analysis first to generate price recommendations
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Prepare chart data
  const priceComparisonData = recommendations.map(rec => ({
    product: rec.product_name.slice(0, 15) + (rec.product_name.length > 15 ? '...' : ''),
    current: rec.current_price,
    recommended: rec.recommended_price,
    change: rec.expected_revenue_change
  }));

  const elasticityDistribution = [
    {
      name: 'Elastic Products',
      value: recommendations.filter(r => r.product_type === 'elastic').length,
      color: '#ef4444'
    },
    {
      name: 'Inelastic Products',
      value: recommendations.filter(r => r.product_type === 'inelastic').length,
      color: '#10b981'
    }
  ];

  const totalPotentialRevenue = recommendations.reduce((sum, rec) => sum + rec.expected_revenue_change, 0);
  const avgElasticity = recommendations.reduce((sum, rec) => sum + Math.abs(rec.elasticity_score), 0) / recommendations.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Price Recommendations</h3>
          <p className="text-muted-foreground">
            AI-driven pricing optimization suggestions
          </p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Potential Revenue Impact</p>
                <p className="text-2xl font-bold">
                  {totalPotentialRevenue >= 0 ? '+' : ''}{totalPotentialRevenue.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Elasticity</p>
                <p className="text-2xl font-bold">{avgElasticity.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Elastic Products</p>
                <p className="text-2xl font-bold">
                  {recommendations.filter(r => r.product_type === 'elastic').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Price Comparison</CardTitle>
            <CardDescription>
              Current vs recommended prices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="product" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">
                            Current: ${data.current.toFixed(2)}
                          </p>
                          <p className="text-sm">
                            Recommended: ${data.recommended.toFixed(2)}
                          </p>
                          <p className="text-sm">
                            Revenue Change: {data.change >= 0 ? '+' : ''}{data.change.toFixed(1)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2}
                  name="Current Price"
                />
                <Line 
                  type="monotone" 
                  dataKey="recommended" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Recommended Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Type Distribution</CardTitle>
            <CardDescription>
              Elastic vs inelastic product breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={elasticityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {elasticityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Recommendations</CardTitle>
          <CardDescription>
            Complete breakdown of all pricing recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={rec.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{rec.product_name}</h4>
                    <p className="text-muted-foreground">{rec.category}</p>
                  </div>
                  <Badge variant={rec.product_type === 'elastic' ? "destructive" : "secondary"}>
                    {rec.product_type === 'elastic' ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    )}
                    {rec.product_type}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Price</p>
                    <p className="font-medium">${rec.current_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Recommended Price</p>
                    <p className="font-medium text-primary">${rec.recommended_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price Change</p>
                    <p className={`font-medium ${rec.recommended_price > rec.current_price ? 'text-green-600' : 'text-red-600'}`}>
                      {rec.recommended_price > rec.current_price ? '+' : ''}
                      {(((rec.recommended_price - rec.current_price) / rec.current_price) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenue Impact</p>
                    <p className={`font-medium ${rec.expected_revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {rec.expected_revenue_change >= 0 ? '+' : ''}{rec.expected_revenue_change.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};