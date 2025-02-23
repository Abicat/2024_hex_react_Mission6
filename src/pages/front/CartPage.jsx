import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import ReactLoading from "react-loading";
import Swal from "sweetalert2";
import Toast from "../../components/common/Toast";

const { VITE_BASE_URL: BASE_URL, VITE_API_PATH: API_PATH } = import.meta.env;

export default function CartPage() {
  const [isScreenLoading, setIsScreenLoading] = useState(false); //全螢幕 Loading
  const [isLoading, setIsLoading] = useState(false);

  const [cart, setCart] = useState({});

  useEffect(() => {
    getCart();
  }, []);

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
    <div className="container">
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
                    <td style={{ width: "150px" }}>
                      <img
                        className="img-fluid"
                        src={cartItem.product.imageUrl}
                        alt={cartItem.product.title}
                      />
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
              className={`form-control ${errors?.tel?.message && "is-invalid"}`}
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
            <button
              type="submit"
              className="btn btn-danger"
              disabled={cart.carts?.length === 0 && true}
            >
              送出訂單
            </button>
          </div>
        </form>
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
    </div>
  );
}
