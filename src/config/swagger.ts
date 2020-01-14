export const swaggerOptions = {
  routePrefix: '/documentation',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'Parcelo API',
      description: 'Backend for Parcelo',
      version: '0.0.1'
    },
    host: 'localhost/api',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'user', description: 'User related end-points' },
      { name: 'product', description: 'Product related end-points' },
      { name: 'shop', description: 'Shop related end-points' },
      { name: 'price', description: 'Price related end-points' },
      { name: 'address', description: 'Address related end-points' },
      { name: 'category', description: 'Category related end-points' },
      { name: 'order', description: 'Order related end-points' }
    ],
  }
}