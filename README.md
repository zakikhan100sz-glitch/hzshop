# hzShop — Full-Stack E-commerce

hzShop is a modern full-stack e-commerce web application for selling **clothes and bags**.  
It includes a customer storefront, WhatsApp-based checkout, and an admin dashboard for managing products and orders.

## Features
- Responsive storefront (Home, Shop, Product, Cart, Checkout)
- **WhatsApp checkout** instead of online payment
- **Admin dashboard** for product and order management
- Product image uploads with **Cloudinary**
- **MongoDB Atlas** database
- **English + Persian (RTL)** language support

## Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS  
- **Backend:** Node.js + Express  
- **Database:** MongoDB (Mongoose)  
- **Image Storage:** Cloudinary  

## Run Locally
```bash
npm run install:all

cd server
npm run dev

cd client
npm run dev