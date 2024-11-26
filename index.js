const fs = require('fs');

// Read the data from the file
fs.readFile('sales-data.txt', 'utf8', (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Parse the data
  const salesData = parseSalesData(data);

  // Process the data to generate reports
  console.log("Total Sales:", getTotalSales(salesData));
  console.log("Month-wise Sales Totals:", getMonthWiseSales(salesData));
  console.log("Most Popular Items:", getMostPopularItems(salesData));
  console.log("Most Revenue Generating Items:", getMostRevenueGeneratingItems(salesData));
  console.log("Order Stats for Most Popular Items:", getOrderStatsForMostPopularItem(salesData));
});

// Helper function to parse the sales data
function parseSalesData(data) {
  const lines = data.split('\n');
  
  const sales = [];

  // Skip the header and parse the rest of the lines
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    // console.log('parts:',parts);
    
    if (parts.length === 5) {
      sales.push({
        item: parts[1].trim(),
        quantity: parseInt(parts[3].trim(), 10),
        price: parseFloat(parts[2].trim()),
        date: parts[0].trim()
      });
    }
  }
console.log('sales',sales);

  return sales;
}

// Helper function to extract the month and year from the date
function getMonthYear(date) {
  const [year, month] = date.split("-"); // Assuming date format is YYYY-MM-DD
  return `${year}-${month}`;
}

// 1. Total Sales
function getTotalSales(data) {
  return data.reduce((total, sale) => total + (sale.quantity * sale.price), 0);
}

// 2. Month-wise Sales Totals
function getMonthWiseSales(data) {
  const salesByMonth = {};

  data.forEach(sale => {
    const month = getMonthYear(sale.date);
    const revenue = sale.quantity * sale.price;

    if (!salesByMonth[month]) {
      salesByMonth[month] = 0;
    }
    salesByMonth[month] += revenue;
  });

  return salesByMonth;
}

// 3. Most Popular Item (most quantity sold) in Each Month
function getMostPopularItems(data) {
  const popularItems = {};

  data.forEach(sale => {
    const month = getMonthYear(sale.date);
    const { item, quantity } = sale;

    if (!popularItems[month]) {
      popularItems[month] = {};
    }

    if (!popularItems[month][item]) {
      popularItems[month][item] = 0;
    }

    popularItems[month][item] += quantity;
  });

  // Find the most popular item for each month
  const mostPopularItems = {};

  for (const month in popularItems) {
    const items = popularItems[month];
    const mostPopular = Object.entries(items).reduce((max, [item, quantity]) => {
      return quantity > max.quantity ? { item, quantity } : max;
    }, { item: "", quantity: 0 });

    mostPopularItems[month] = mostPopular;
  }

  return mostPopularItems;
}

// 4. Items Generating Most Revenue in Each Month
function getMostRevenueGeneratingItems(data) {
  const revenueByItem = {};

  data.forEach(sale => {
    const month = getMonthYear(sale.date);
    const { item, quantity, price } = sale;
    const revenue = quantity * price;

    if (!revenueByItem[month]) {
      revenueByItem[month] = {};
    }

    if (!revenueByItem[month][item]) {
      revenueByItem[month][item] = 0;
    }

    revenueByItem[month][item] += revenue;
  });

  // Find the item generating the most revenue for each month
  const mostRevenueItems = {};

  for (const month in revenueByItem) {
    const items = revenueByItem[month];
    const mostRevenue = Object.entries(items).reduce((max, [item, revenue]) => {
      return revenue > max.revenue ? { item, revenue } : max;
    }, { item: "", revenue: 0 });

    mostRevenueItems[month] = mostRevenue;
  }

  return mostRevenueItems;
}

// 5. Min, Max, Average Number of Orders for the Most Popular Item Each Month
function getOrderStatsForMostPopularItem(data) {
  const orderStats = {};

  data.forEach(sale => {
    const month = getMonthYear(sale.date);
    const { item, quantity } = sale;

    if (!orderStats[month]) {
      orderStats[month] = {};
    }

    if (!orderStats[month][item]) {
      orderStats[month][item] = [];
    }

    orderStats[month][item].push(quantity);
  });

  // Now we calculate the min, max, and average for the most popular item
  const stats = {};

  for (const month in orderStats) {
    const items = orderStats[month];
    const mostPopularItem = getMostPopularItems(data)[month].item;

    if (items[mostPopularItem]) {
      const quantities = items[mostPopularItem];
      const min = Math.min(...quantities);
      const max = Math.max(...quantities);
      const avg = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;

      stats[month] = { min, max, avg };
    }
  }

  return stats;
}
