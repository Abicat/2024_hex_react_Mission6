import { useEffect, useState } from "react";
import axios from "axios";
import ReactLoading from "react-loading";
import Toast from "../../components/common/Toast";
import { useParams } from "react-router-dom";

const { VITE_BASE_URL: BASE_URL, VITE_API_PATH: API_PATH } = import.meta.env;

export default function ProductDetailPage() {
  const [product, setProduct] = useState([]);

  const [isScreenLoading, setIsScreenLoading] = useState(false); //全螢幕 Loading
  const [isLoading, setIsLoading] = useState(false);

  const [qtySelect, setQtySelect] = useState(1);

  const product_id = useParams();

  useEffect(() => {
    const getProduct = async () => {
      setIsScreenLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/v2/api/${API_PATH}/product/${product_id.id}`
        );
        // console.log(product_id);
        setProduct(res.data.product);
      } catch (error) {
        alert("取得產品失敗");
      } finally {
        setIsScreenLoading(false);
      }
    };
    getProduct();
  }, [product_id]);

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
    <div className="container mt-5">
      <div className="row">
        <div className="col-6">
          <img
            className="img-fluid"
            src={product.imageUrl}
            alt={product.title}
          />
        </div>
        <div className="col-6">
          <div className="mb-4 d-flex align-items-center gap-2">
            <h2>{product.title}</h2>
            <span className="badge text-bg-success">{product.category}</span>
          </div>
          <p className="mb-3">內容：{product.content}</p>
          <p className="mb-3">描述：{product.description}</p>
          <p>
            價錢：<del>{product.origin_price}</del> {product.price} 元
          </p>
          <div className="input-group align-items-center w-75">
            <select
              value={qtySelect}
              onChange={(e) => setQtySelect(e.target.value)}
              id="qtySelect"
              className="form-select"
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-danger d-flex"
              disabled={isLoading}
              onClick={() => {
                addCart(product.id, qtySelect);
              }}
            >
              加入購物車
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
        </div>
      </div>
    </div>
  );
}
