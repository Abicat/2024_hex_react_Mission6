import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import { useForm } from "react-hook-form";
import ReactLoading from "react-loading";
import Swal from "sweetalert2";
import Toast from "./components/common/Toast";

const { VITE_BASE_URL: BASE_URL, VITE_API_PATH: API_PATH } = import.meta.env;

function App() {
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState([]);
  const [cart, setCart] = useState({}); // 購物車產品資訊

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
    getCart();
  }, []);

  const productModalRef = useRef(null);
  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
  }, []);

  const openModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };

  const closeModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  };

  const handleSeeMore = (product) => {
    setTempProduct(product);
    setQtySelect(1);
    openModal();
  };

  const [qtySelect, setQtySelect] = useState(1);

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
      getCart();
      closeModal();
    } catch (error) {
      alert(`加入購物車失敗：${error.response.data.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 取得購物車產品列表
  const getCart = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/cart`);
      setCart(res.data.data);
    } catch (error) {
      alert(`取得購物車產品失敗：${error.response.data.message}`);
    }
  };

  //移除購物車品項
  const removeCart = async (cartItem_id, cartItem_product_title) => {
    const url = cartItem_id
      ? `${BASE_URL}/v2/api/${API_PATH}/cart/${cartItem_id}`
      : `${BASE_URL}/v2/api/${API_PATH}/carts`;

    const result = cartItem_id
      ? await Swal.fire({
          title: `您確定要刪除${cartItem_product_title}?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "刪除",
          cancelButtonText: "取消",
        })
      : await Swal.fire({
          title: "您確定要清空所有品項?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "刪除",
          cancelButtonText: "取消",
        });

    if (result.isConfirmed) {
      setIsScreenLoading(true);
      try {
        await axios.delete(url);
        getCart();
      } catch (error) {
        alert(`刪除購物車產品失敗：${error.response.data.message}`);
      } finally {
        setIsScreenLoading(false);
      }
    }
  };

  // 調整購物車產品數量
  const updateCart = async (cartItem_id, product_id, qty) => {
    setIsScreenLoading(true);
    try {
      await axios.put(`${BASE_URL}/v2/api/${API_PATH}/cart/${cartItem_id}`, {
        data: {
          product_id,
          qty: Number(qty),
        },
      });
      getCart();
    } catch (error) {
      alert(`調整購物車產品數量失敗：${error.response.data.message}`);
    } finally {
      setIsScreenLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onTouched",
  });

  const onSubmit = (data) => {
    if (cart.carts.length <= 0) {
      alert("購物車中沒有產品");
      return;
    }

    const { message, ...user } = data;

    const userInfo = {
      data: {
        user,
        message,
      },
    };
    sendOrder(userInfo);
  };

  // 送出訂單
  const sendOrder = async (data) => {
    setIsScreenLoading(true);
    try {
      await axios.post(`${BASE_URL}/v2/api/${API_PATH}/order`, data);
      Toast.fire({
        icon: "success",
        title: "訂單已成功送出",
      });
      reset(); // 清除表單
      getCart();
    } catch (error) {
      alert(`送出訂單失敗：${error.response.data.message}`);
    } finally {
      setIsScreenLoading(false);
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
                      <button
                        onClick={() => handleSeeMore(product)}
                        type="button"
                        className="btn btn-outline-secondary"
                      >
                        查看更多
                      </button>
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

          <div
            ref={productModalRef}
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            className="modal fade"
            id="productModal"
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title fs-5">
                    產品名稱：{tempProduct.title}
                  </h2>
                  <button
                    onClick={closeModal}
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <img
                    src={tempProduct.imageUrl}
                    alt={tempProduct.title}
                    className="img-fluid mb-3"
                  />
                  <p>內容：{tempProduct.content}</p>
                  <p>描述：{tempProduct.description}</p>
                  <p>
                    價錢：{tempProduct.price}{" "}
                    <del>{tempProduct.origin_price}</del> 元
                  </p>
                  <div className="input-group align-items-center">
                    <label htmlFor="qtySelect">數量：</label>
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
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={isLoading}
                    onClick={() => {
                      addCart(tempProduct.id, qtySelect);
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

          {cart.carts?.length > 0 && (
            <>
              <div className="text-end py-3">
                <button
                  className="btn btn-outline-danger"
                  type="button"
                  onClick={() => removeCart()}
                >
                  清空購物車
                </button>
              </div>
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th></th>
                    <th>品名</th>
                    <th style={{ width: "150px" }}>數量/單位</th>
                    <th className="text-end">單價</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.carts?.map((cartItem) => {
                    return (
                      <tr key={cartItem.id}>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              removeCart(cartItem.id, cartItem.product.title);
                            }}
                          >
                            x
                          </button>
                        </td>
                        <td>{cartItem.product.title}</td>
                        <td style={{ width: "150px" }}>
                          <div className="d-flex align-items-center">
                            <div className="btn-group me-2" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-dark btn-sm"
                                onClick={() => {
                                  updateCart(
                                    cartItem.id,
                                    cartItem.product_id,
                                    cartItem.qty - 1
                                  );
                                }}
                                disabled={cartItem.qty === 1}
                              >
                                -
                              </button>
                              <span
                                className="btn border border-dark"
                                style={{ width: "50px", cursor: "auto" }}
                              >
                                {cartItem.qty}
                              </span>
                              <button
                                type="button"
                                className="btn btn-outline-dark btn-sm"
                                onClick={() => {
                                  updateCart(
                                    cartItem.id,
                                    cartItem.product_id,
                                    cartItem.qty + 1
                                  );
                                }}
                              >
                                +
                              </button>
                            </div>
                            <span className="input-group-text bg-transparent border-0">
                              {cartItem.product.unit}
                            </span>
                          </div>
                        </td>
                        <td className="text-end">{cartItem.total} 元</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end">
                      總計：{cart.total} 元
                    </td>
                    <td className="text-end" style={{ width: "130px" }}></td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </div>

        <div className="my-5 row justify-content-center">
          <form className="col-md-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`form-control ${
                  errors?.email?.message && "is-invalid"
                }`}
                placeholder="請輸入 Email"
                {...register("email", {
                  required: "Email 為必填",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Email 格式不正確",
                  },
                })}
              />
              {errors.email && (
                <p className="text-danger my-2">{errors?.email?.message}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                收件人姓名
              </label>
              <input
                id="name"
                className={`form-control ${
                  errors?.name?.message && "is-invalid"
                }`}
                placeholder="請輸入姓名"
                {...register("name", {
                  required: "姓名為必填",
                })}
              />
              {errors.name && (
                <p className="text-danger my-2">{errors?.name?.message}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="tel" className="form-label">
                收件人電話
              </label>
              <input
                id="tel"
                type="tel"
                className={`form-control ${
                  errors?.tel?.message && "is-invalid"
                }`}
                placeholder="請輸入電話"
                {...register("tel", {
                  required: "電話為必填",
                  pattern: {
                    value: /^(0[2-8]\d{8}|09\d{8})$/,
                    message: "電話格式不正確",
                  },
                  minLength: {
                    value: 8,
                    message: "電話不少於 8 碼",
                  },
                })}
              />
              {errors.tel && (
                <p className="text-danger my-2">{errors?.tel?.message}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                收件人地址
              </label>
              <input
                id="address"
                type="text"
                className={`form-control ${
                  errors?.address?.message && "is-invalid"
                }`}
                placeholder="請輸入地址"
                {...register("address", {
                  required: "地址為必填",
                })}
              />

              {errors.address && (
                <p className="text-danger my-2">{errors?.address?.message}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="message" className="form-label">
                留言
              </label>
              <textarea
                id="message"
                className="form-control"
                {...register("message")}
                cols="30"
                rows="10"
              ></textarea>
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-danger" disabled={cart.carts?.length === 0 && true}>
                送出訂單
              </button>
            </div>
          </form>
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

export default App;
