export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  
    const { priceId, email, name, username } = req.body
  
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { instagram: username }
      })
  
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent']
      })
  
      res.status(200).json({
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        customerId: customer.id
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }