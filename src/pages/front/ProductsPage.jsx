import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ReactLoading from "react-loading";
import Toast from "../../components/common/Toast";

const { VITE_BASE_URL: BASE_URL, VITE_API_PATH: API_PATH } = import.meta.env;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  const [isScreenLoading, setIsScreenLoading] = useState(false); //全螢幕 Loading
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getProducts = async () => {
      setIsScreenLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/products`);
        setProducts(res.data.products);
      } catch (error) {
        alert("取得產品失敗");
        // console.log("取得產品列表失敗", error);
      } finally {
        setIsScreenLoading(false);
      }
    };
    getProducts();
  }, []);

  // 加入購物車
  const addCart = async (product_id, qty) => {
    setIsLoading(true);
    try {
      await axios.post(`${BASE_URL}/v2/api/${API_PATH}/cart`, {
        data: {
          product_id,
          qty: Number(qty),
        },
      });
      Toast.fire({
        icon: "success",
        title: "商品已加入購物車!",
      });
    } catch (error) {
      alert(`加入購物車失敗：${error.response.data.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <div className="mt-4">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>圖片</th>
                <th>商品名稱</th>
                <th>價格</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ width: "200px" }}>
                    <img
                      className="img-fluid"
                      src={product.imageUrl}
                      alt={product.title}
                    />
                  </td>
                  <td>{product.title}</td>
                  <td>
                    <del className="h6">原價 {product.origin_price} 元</del>
                    <div className="h5">特價 {product.price}元</div>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link
                        to={`/products/${product.id}`}
                        className="btn btn-outline-secondary"
                      >
                        查看更多
                      </Link>
                      <button
                        type="button"
                        className="btn btn-outline-danger d-flex align-items-center gap-2"
                        disabled={isLoading}
                        onClick={() => {
                          addCart(product.id, 1);
                        }}
                      >
                        加到購物車
                        {isLoading && (
                          <ReactLoading
                            type={"spin"}
                            color={"#000"}
                            height={"1.5rem"}
                            width={"1.5rem"}
                          />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isScreenLoading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.3)",
            zIndex: 999,
          }}
        >
          <ReactLoading type="spin" color="black" width="4rem" height="4rem" />
        </div>
      )}
    </>
  );
}
