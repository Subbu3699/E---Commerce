export interface SalesDataPoint {
  price: number;
  quantity_sold: number;
  product_name: string;
  category: string;
  sale_date: string;
}

export interface ElasticityResult {
  elasticity: number;
  r_squared: number;
  is_elastic: boolean;
  product_name: string;
  category: string;
  current_price: number;
  recommended_price: number;
  expected_revenue_change: number;
}

/**
 * Calculate price elasticity of demand using log-log regression
 * Elasticity = (% change in quantity) / (% change in price)
 */
export function calculateElasticity(dataPoints: SalesDataPoint[]): ElasticityResult | null {
  if (dataPoints.length < 2) return null;

  // Group by product and sort by date
  const sortedData = dataPoints.sort((a, b) => new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime());
  
  // Convert to log values for log-log regression
  const logPoints = sortedData.map(point => ({
    logPrice: Math.log(point.price),
    logQuantity: Math.log(point.quantity_sold),
    price: point.price,
    quantity: point.quantity_sold
  })).filter(point => isFinite(point.logPrice) && isFinite(point.logQuantity));

  if (logPoints.length < 2) return null;

  // Calculate means
  const n = logPoints.length;
  const meanLogPrice = logPoints.reduce((sum, p) => sum + p.logPrice, 0) / n;
  const meanLogQuantity = logPoints.reduce((sum, p) => sum + p.logQuantity, 0) / n;

  // Calculate slope (elasticity) using least squares
  let numerator = 0;
  let denominator = 0;

  for (const point of logPoints) {
    const priceDeviation = point.logPrice - meanLogPrice;
    const quantityDeviation = point.logQuantity - meanLogQuantity;
    numerator += priceDeviation * quantityDeviation;
    denominator += priceDeviation * priceDeviation;
  }

  if (denominator === 0) return null;

  const elasticity = numerator / denominator;

  // Calculate R-squared
  const predicted = logPoints.map(point => 
    meanLogQuantity + elasticity * (point.logPrice - meanLogPrice)
  );
  
  const totalSumSquares = logPoints.reduce((sum, point) => 
    sum + Math.pow(point.logQuantity - meanLogQuantity, 2), 0
  );
  
  const residualSumSquares = logPoints.reduce((sum, point, i) => 
    sum + Math.pow(point.logQuantity - predicted[i], 2), 0
  );

  const r_squared = totalSumSquares > 0 ? 1 - (residualSumSquares / totalSumSquares) : 0;

  // Determine if product is elastic (|elasticity| > 1)
  const is_elastic = Math.abs(elasticity) > 1;

  // Calculate current average price and recommend new price
  const current_price = sortedData[sortedData.length - 1].price;
  const current_quantity = sortedData[sortedData.length - 1].quantity_sold;
  
  let recommended_price: number;
  let expected_revenue_change: number;

  if (is_elastic) {
    // For elastic products, lower price to increase revenue
    recommended_price = current_price * 0.9; // 10% decrease
    const predicted_quantity = current_quantity * Math.pow(recommended_price / current_price, elasticity);
    const current_revenue = current_price * current_quantity;
    const predicted_revenue = recommended_price * predicted_quantity;
    expected_revenue_change = ((predicted_revenue - current_revenue) / current_revenue) * 100;
  } else {
    // For inelastic products, raise price to increase profit
    recommended_price = current_price * 1.1; // 10% increase
    const predicted_quantity = current_quantity * Math.pow(recommended_price / current_price, elasticity);
    const current_revenue = current_price * current_quantity;
    const predicted_revenue = recommended_price * predicted_quantity;
    expected_revenue_change = ((predicted_revenue - current_revenue) / current_revenue) * 100;
  }

  return {
    elasticity,
    r_squared,
    is_elastic,
    product_name: dataPoints[0].product_name,
    category: dataPoints[0].category,
    current_price,
    recommended_price,
    expected_revenue_change
  };
}

/**
 * Optimize price for maximum revenue or profit
 */
export function optimizePrice(
  elasticity: number, 
  currentPrice: number, 
  currentQuantity: number,
  costPerUnit: number = 0,
  optimizationTarget: 'revenue' | 'profit' = 'revenue'
): { optimal_price: number; expected_change: number } {
  
  if (optimizationTarget === 'revenue') {
    // For revenue optimization: optimal price when elasticity = -1
    // But we'll use a more practical approach
    if (Math.abs(elasticity) > 1) {
      // Elastic: decrease price
      const optimal_price = currentPrice * 0.85;
      const predicted_quantity = currentQuantity * Math.pow(optimal_price / currentPrice, elasticity);
      const current_revenue = currentPrice * currentQuantity;
      const predicted_revenue = optimal_price * predicted_quantity;
      const expected_change = ((predicted_revenue - current_revenue) / current_revenue) * 100;
      
      return { optimal_price, expected_change };
    } else {
      // Inelastic: increase price
      const optimal_price = currentPrice * 1.15;
      const predicted_quantity = currentQuantity * Math.pow(optimal_price / currentPrice, elasticity);
      const current_revenue = currentPrice * currentQuantity;
      const predicted_revenue = optimal_price * predicted_quantity;
      const expected_change = ((predicted_revenue - current_revenue) / current_revenue) * 100;
      
      return { optimal_price, expected_change };
    }
  } else {
    // Profit optimization
    const optimal_price = currentPrice * (Math.abs(elasticity) > 1 ? 0.9 : 1.2);
    const predicted_quantity = currentQuantity * Math.pow(optimal_price / currentPrice, elasticity);
    const current_profit = (currentPrice - costPerUnit) * currentQuantity;
    const predicted_profit = (optimal_price - costPerUnit) * predicted_quantity;
    const expected_change = current_profit > 0 ? ((predicted_profit - current_profit) / current_profit) * 100 : 0;
    
    return { optimal_price, expected_change };
  }
}