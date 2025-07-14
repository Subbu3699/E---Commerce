import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';
import { calculateElasticity, SalesDataPoint, ElasticityResult } from '@/utils/elasticity';

export const ElasticityAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [elasticityResults, setElasticityResults] = useState<ElasticityResult[]>([]);

  useEffect(() => {
    if (user) {
      fetchSalesData();
    }
  }, [user]);

  const fetchSalesData = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_data')
        .select('product_name, category, price, quantity_sold, sale_date')
        .eq('user_id', user?.id)
        .order('sale_date', { ascending: true });

      if (error) throw error;

      setSalesData(data || []);
      analyzeElasticity(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch sales data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeElasticity = (data: SalesDataPoint[]) => {
    // Group data by product
    const productGroups = data.reduce((groups, item) => {
      const key = item.product_name;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, SalesDataPoint[]>);

    // Calculate elasticity for each product
    const results: ElasticityResult[] = [];
    Object.entries(productGroups).forEach(([productName, productData]) => {
      if (productData.length >= 2) {
        const result = calculateElasticity(productData);
        if (result) {
          results.push(result);
        }
      }
    });

    setElasticityResults(results);
  };

  const saveRecommendations = async () => {
    if (!user || elasticityResults.length === 0) return;

    setLoading(true);
    try {
      const recommendations = elasticityResults.map(result => ({
        user_id: user.id,
        product_name: result.product_name,
        category: result.category,
        current_price: result.current_price,
        recommended_price: result.recommended_price,
        elasticity_score: result.elasticity,
        product_type: result.is_elastic ? 'elastic' : 'inelastic',
        expected_revenue_change: result.expected_revenue_change,
        optimization_target: 'revenue' as const
      }));

      const { error } = await supabase
        .from('price_recommendations')
        .upsert(recommendations, {
          onConflict: 'user_id,product_name',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Price recommendations saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Analyzing price elasticity...</p>
      </div>
    );
  }

  if (salesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Sales Data Available</CardTitle>
          <CardDescription>
            Upload sales data to perform elasticity analysis
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = elasticityResults.map(result => ({
    product: result.product_name.slice(0, 15) + (result.product_name.length > 15 ? '...' : ''),
    elasticity: Math.abs(result.elasticity),
    type: result.is_elastic ? 'Elastic' : 'Inelastic',
    r_squared: result.r_squared
  }));

  const scatterData = salesData.map(point => ({
    price: point.price,
    quantity: point.quantity_sold,
    product: point.product_name
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Price Elasticity Analysis</h3>
          <p className="text-muted-foreground">
            Understanding demand sensitivity to price changes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSalesData} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveRecommendations} disabled={loading || elasticityResults.length === 0}>
            Save Recommendations
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Elasticity by Product</CardTitle>
            <CardDescription>
              Higher values indicate more price-sensitive demand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
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
                            Elasticity: {data.elasticity.toFixed(2)}
                          </p>
                          <p className="text-sm">
                            Type: {data.type}
                          </p>
                          <p className="text-sm">
                            R²: {data.r_squared.toFixed(3)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="elasticity" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price vs Quantity Relationship</CardTitle>
            <CardDescription>
              Scatter plot showing price-quantity correlation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="price" 
                  domain={['dataMin', 'dataMax']}
                  name="Price"
                />
                <YAxis 
                  type="number" 
                  dataKey="quantity" 
                  domain={['dataMin', 'dataMax']}
                  name="Quantity"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{data.product}</p>
                          <p className="text-sm">Price: ${data.price}</p>
                          <p className="text-sm">Quantity: {data.quantity}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  dataKey="quantity" 
                  fill="hsl(var(--primary))"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {elasticityResults.map((result, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{result.product_name}</CardTitle>
                  <CardDescription>{result.category}</CardDescription>
                </div>
                <Badge variant={result.is_elastic ? "destructive" : "secondary"}>
                  {result.is_elastic ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {result.is_elastic ? 'Elastic' : 'Inelastic'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Elasticity:</span>
                <span className="font-medium">{result.elasticity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">R²:</span>
                <span className="font-medium">{result.r_squared.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Price:</span>
                <span className="font-medium">${result.current_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recommended:</span>
                <span className="font-medium text-primary">
                  ${result.recommended_price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue Change:</span>
                <span className={`font-medium ${result.expected_revenue_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.expected_revenue_change >= 0 ? '+' : ''}{result.expected_revenue_change.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};