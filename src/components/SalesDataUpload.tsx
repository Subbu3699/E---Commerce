import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Plus } from 'lucide-react';

interface SalesRecord {
  product_name: string;
  category: string;
  price: number;
  quantity_sold: number;
  sale_date: string;
}

export const SalesDataUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SalesRecord>({
    product_name: '',
    category: '',
    price: 0,
    quantity_sold: 0,
    sale_date: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: keyof SalesRecord, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSingleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sales_data')
        .insert([{
          user_id: user.id,
          ...formData
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sales record added successfully",
      });

      // Reset form
      setFormData({
        product_name: '',
        category: '',
        price: 0,
        quantity_sold: 0,
        sale_date: new Date().toISOString().split('T')[0]
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

  const generateMockData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const mockData = [
        // Electronics - Elastic products
        { product_name: 'Gaming Laptop', category: 'Electronics', price: 1200, quantity_sold: 25, sale_date: '2024-01-15' },
        { product_name: 'Gaming Laptop', category: 'Electronics', price: 1000, quantity_sold: 45, sale_date: '2024-02-15' },
        { product_name: 'Gaming Laptop', category: 'Electronics', price: 800, quantity_sold: 80, sale_date: '2024-03-15' },
        
        { product_name: 'Wireless Headphones', category: 'Electronics', price: 150, quantity_sold: 40, sale_date: '2024-01-20' },
        { product_name: 'Wireless Headphones', category: 'Electronics', price: 120, quantity_sold: 70, sale_date: '2024-02-20' },
        { product_name: 'Wireless Headphones', category: 'Electronics', price: 100, quantity_sold: 120, sale_date: '2024-03-20' },

        // Books - Inelastic products
        { product_name: 'Programming Guide', category: 'Books', price: 50, quantity_sold: 100, sale_date: '2024-01-10' },
        { product_name: 'Programming Guide', category: 'Books', price: 45, quantity_sold: 105, sale_date: '2024-02-10' },
        { product_name: 'Programming Guide', category: 'Books', price: 55, quantity_sold: 95, sale_date: '2024-03-10' },

        { product_name: 'Business Strategy', category: 'Books', price: 30, quantity_sold: 80, sale_date: '2024-01-25' },
        { product_name: 'Business Strategy', category: 'Books', price: 35, quantity_sold: 75, sale_date: '2024-02-25' },
        { product_name: 'Business Strategy', category: 'Books', price: 25, quantity_sold: 85, sale_date: '2024-03-25' },

        // Clothing - Mixed elasticity
        { product_name: 'Designer T-Shirt', category: 'Clothing', price: 80, quantity_sold: 30, sale_date: '2024-01-05' },
        { product_name: 'Designer T-Shirt', category: 'Clothing', price: 60, quantity_sold: 60, sale_date: '2024-02-05' },
        { product_name: 'Designer T-Shirt', category: 'Clothing', price: 40, quantity_sold: 100, sale_date: '2024-03-05' },

        // Food - Inelastic
        { product_name: 'Organic Coffee', category: 'Food', price: 15, quantity_sold: 200, sale_date: '2024-01-08' },
        { product_name: 'Organic Coffee', category: 'Food', price: 18, quantity_sold: 190, sale_date: '2024-02-08' },
        { product_name: 'Organic Coffee', category: 'Food', price: 12, quantity_sold: 210, sale_date: '2024-03-08' },
      ].map(item => ({
        user_id: user.id,
        ...item
      }));

      const { error } = await supabase
        .from('sales_data')
        .insert(mockData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Generated ${mockData.length} mock sales records`,
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Single Record
            </CardTitle>
            <CardDescription>
              Manually add a sales record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSingleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => handleInputChange('product_name', e.target.value)}
                  placeholder="iPhone 15 Pro"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Electronics"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity_sold">Quantity Sold</Label>
                  <Input
                    id="quantity_sold"
                    type="number"
                    min="0"
                    value={formData.quantity_sold || ''}
                    onChange={(e) => handleInputChange('quantity_sold', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sale_date">Sale Date</Label>
                <Input
                  id="sale_date"
                  type="date"
                  value={formData.sale_date}
                  onChange={(e) => handleInputChange('sale_date', e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Adding...' : 'Add Record'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Mock Data Generator
            </CardTitle>
            <CardDescription>
              Generate sample sales data for testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">This will generate realistic sample data including:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Electronics (elastic products)</li>
                <li>Books (inelastic products)</li>
                <li>Clothing (mixed elasticity)</li>
                <li>Food items (inelastic)</li>
              </ul>
            </div>
            
            <Button 
              onClick={generateMockData} 
              variant="outline" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Mock Data'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};