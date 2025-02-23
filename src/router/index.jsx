import { createHashRouter } from "react-router";
import FrontLayout from "../layout/FrontLayout";
import ProductsPage from "../pages/front/ProductsPage";
import ProductDetailPage from "../pages/front/ProductDetailPage";
import CartPage from "../pages/front/CartPage";
import HomePage from "../pages/front/HomePage"
import NotFoundPage from "../pages/front/NotFoundPage";
import AdminLayout from "../layout/AdminLayout";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminLogin from "../pages/AdminLogin";

const router = createHashRouter([
    {
        path: '/',
        element: <FrontLayout />,
        children: [
            {
                path: '',
                element: <HomePage />
            },
            {
                path: 'products',
                element: <ProductsPage />
            },
            {
                path: 'products/:id',
                element: <ProductDetailPage />
            },
            {
                path: 'cart',
                element: <CartPage />
            }
        ]
    },
    {
        path: '/adminLogin',
        element: <AdminLogin />
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                path: '',
                element: <AdminOrders />
            },
            {
                path: 'orders',
                element: <AdminOrders />
            },
            {
                path: 'products',
                element: <AdminProducts />
            }
        ]
    },
    {
        path: "*",
        element: <NotFoundPage />
    }
]);

export default router;